// https://github.com/GoogleChrome/lighthouse/blob/HEAD/docs/readme.md#using-programmatically
// https://leonardofaria.net/2020/11/30/the-undocumented-lighthouse-guide/
// https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/config/default-config.js

import fs from 'fs';
import url from 'url';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import * as TablePrinter from 'console-table-printer';
import Open from 'open';

const table = new TablePrinter.Table({
  /* @ToDo: [1] Add column FCP (First Contentful Paint) */
  /* @ToDo: [1] Add column LCP (Largest Contentful Paint) */
  /* @ToDo: [1] Add column TBT (Total Blocking Time) */
  /* @ToDo: [1] Add column CLS (Cumulative Layout Shift) */
  columns: [
    { name: "site", alignment: "left" },
    { name: "FCP", alignment: "right" },
    { name: "SI", alignment: "right" },
    { name: "CLS", alignment: "right" },
    { name: "LCP", alignment: "right" },
    { name: "TBT", alignment: "right" },
    { name: "score", alignment: "right" }
  ],
});

class Lighthouse {
  
  static async run(sites){
    
    this.start = Date.now();
    console.log('Start:'+ this.start);
    
    // Config
    switch (typeof sites) {
      case 'string':
        this.sites = [sites];
        break;
      case 'object':
        this.sites = sites;
        break;
      default:
        this.sites = fs.readFileSync('./input.txt', 'utf8').split('\n');
    }
    this.output = [];
    
    // Run 
    this.chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
    this.runLighthouse(this.sites.pop());
  }
  
  static async runLighthouse (site) {
    
    let siteCode = this.urlToCode(site);
    
    console.log(`Analyzing ${siteCode}...`);
    
    /* @ToDo: [1] Read config fron inherind config file */
    const lighthouseOptions = {
      logLevel: 'silent', // silent | error | info | verbose
      output: ['html', 'json'], // json | html | csv
      /* @ToDo: [1] add options to choose mobile or desktop */
      onlyCategories: ['performance'],
      port: this.chrome.port
    };
    const runnerResult = await lighthouse(site, lighthouseOptions);
    
    // `.report` is the HTML report as a string
    fs.writeFileSync(`reports/${siteCode}.html`, runnerResult.report[0]);
    
    let reportJSON = JSON.parse(runnerResult.report[1]);
    
    let row = {
      site: site,
      FCP: Math.round(reportJSON.audits['first-contentful-paint'].score * 100, 0),
      SI: Math.round(reportJSON.audits['speed-index'].score * 100, 0),
      LCP: Math.round(reportJSON.audits['largest-contentful-paint'].score * 100, 0),
      TBT: Math.round(reportJSON.audits['total-blocking-time'].score * 100, 0),
      CLS: Math.round(reportJSON.audits['cumulative-layout-shift'].score * 100, 0),
      score: Math.round(runnerResult.lhr.categories.performance.score * 100, 0),
    };
    
    table.addRow(row);
    
    row.reportFile = `${siteCode}.html`;
    this.output.push(row);
    
    if(this.sites.length){
      this.runLighthouse(this.sites.pop());
    }else{
      table.printTable();
      this.exportHtml();
      await this.chrome.kill();
      this.end = Date.now();
      console.log('End: '+ this.end);
      console.log('Time elapsed (seconds): ' + Math.ceil((this.end - this.start)/1000));
    }
  }
  
  static exportHtml(){
    let htmlString = '';
    this.output.forEach((item, i) => {
      htmlString += `
      <tr>
        <td><a href="${item.reportFile}">${item.site}</a></td>
        <td>${item.FCP}</td>
        <td>${item.SI}</td>
        <td>${item.LCP}</td>
        <td>${item.TBT}</td>
        <td>${item.CLS}</td>
        <td>${item.score}</td>
      </tr>`;
    });
    let htmlTemplate = fs.readFileSync('./template.html', 'utf8');
    htmlTemplate = htmlTemplate.replace('@@code@@', htmlString);
    fs.writeFileSync(`reports/index.html`, htmlTemplate);
    console.log('See report at reports/index.html');
    Open('reports/index.html');
  }
  
  static urlToCode(url){
    const myURL = new URL(url);
    return myURL.hostname;
  }
  
}

Lighthouse.run();
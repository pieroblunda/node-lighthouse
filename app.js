// https://github.com/GoogleChrome/lighthouse/blob/HEAD/docs/readme.md#using-programmatically
// https://leonardofaria.net/2020/11/30/the-undocumented-lighthouse-guide/
// https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/config/default-config.js

import fs from 'fs';
import url from 'url';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import * as TablePrinter from 'console-table-printer';


const table = new TablePrinter.Table({
  columns: [
    { name: "site", alignment: "left" },
    { name: "score", alignment: "right" },
    { name: "cls_score", alignment: "right" },
    { name: "numericValue", alignment: "right" },
    { name: "weight", alignment: "right" },
  ],
});

class Lighthouse {
  
  static run(sites){
    
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
    this.runLighthouse(this.sites.pop());
  }
  
  static async runLighthouse (site) {
    
    let siteCode = this.urlToCode(site);
    
    console.log(`Analyzing ${siteCode}...`);
    
    const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
    const lighthouseOptions = {
      logLevel: 'silent', // silent | error | info | verbose
      output: 'html', // json | html | csv
      onlyCategories: ['performance'],
      port: chrome.port
    };
    const runnerResult = await lighthouse(site, lighthouseOptions);
    
    // `.report` is the HTML report as a string
    const reportHtml = runnerResult.report;
    fs.writeFileSync(`reports/${siteCode}.html`, reportHtml);
    
    table.addRow({
      site: site,
      score: runnerResult.lhr.categories.performance.score * 100,
      cls_score: runnerResult.lhr.audits["cumulative-layout-shift"].score,
      numericValue: runnerResult.lhr.audits["cumulative-layout-shift"].numericValue,
      weight: runnerResult.lhr.categories.performance.auditRefs[5].weight
    });
    this.output.push({
      site: site,
      reportFile: `${siteCode}.html`,
      score: runnerResult.lhr.categories.performance.score * 100
    });
    
    if(this.sites.length){
      this.runLighthouse(this.sites.pop());
    }else{
      table.printTable();
      this.exportHtml();
    }
    
    await chrome.kill();
    
  }
  
  static exportHtml(){
    let htmlString = '';
    this.output.forEach((item, i) => {
      htmlString += `<tr><td><a href="${item.reportFile}">${item.site}</a></td><td>${item.score}</td></tr>`;
    });
    let htmlTemplate = fs.readFileSync('./template.html', 'utf8');
    htmlTemplate = htmlTemplate.replace('@@code@@', htmlString);
    fs.writeFileSync(`reports/index.html`, htmlTemplate);
    console.log('See report at reports/index.html');
  }
  
  static urlToCode(url){
    const myURL = new URL(url);
    return myURL.hostname;
  }
  
}

Lighthouse.run([
  'https://console-table.netlify.app/docs/doc-alignment/',
  'https://developer.apple.com/safari/technology-preview/release-notes/'
]);
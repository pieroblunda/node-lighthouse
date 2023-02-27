// https://github.com/GoogleChrome/lighthouse/blob/HEAD/docs/readme.md#using-programmatically
// https://leonardofaria.net/2020/11/30/the-undocumented-lighthouse-guide/
// https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/config/default-config.js

import fs from 'fs';
import url from 'url';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';

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
      FCP: {
        bulletHTML: this.getBulletHTML(Math.round(reportJSON.audits['first-contentful-paint'].score * 100, 0)),
        score: Math.round(reportJSON.audits['first-contentful-paint'].score * 100, 0)
      },
      SI: {
        bulletHTML: this.getBulletHTML(Math.round(reportJSON.audits['speed-index'].score * 100, 0)),
        score: Math.round(reportJSON.audits['speed-index'].score * 100, 0)
      },
      LCP: {
        bulletHTML: this.getBulletHTML(Math.round(reportJSON.audits['largest-contentful-paint'].score * 100, 0)),
        score: Math.round(reportJSON.audits['largest-contentful-paint'].score * 100, 0)
      },
      TBT: {
        bulletHTML: this.getBulletHTML(Math.round(reportJSON.audits['total-blocking-time'].score * 100, 0)),
        score: Math.round(reportJSON.audits['total-blocking-time'].score * 100, 0)
      },
      CLS: {
        bulletHTML: this.getBulletHTML(Math.round(reportJSON.audits['cumulative-layout-shift'].score * 100, 0)),
        score: Math.round(reportJSON.audits['cumulative-layout-shift'].score * 100, 0)
      },
      score: this.getFormattedScore(Math.round(runnerResult.lhr.categories.performance.score * 100, 0)),
    };
    
    row.reportFile = `${siteCode}.html`;
    this.output.push(row);
    
    if(this.sites.length){
      this.runLighthouse(this.sites.pop());
    }else{
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
        <td>${item.FCP.bulletHTML}</td>
        <td>${item.SI.bulletHTML}</td>
        <td>${item.LCP.bulletHTML}</td>
        <td>${item.TBT.bulletHTML}</td>
        <td>${item.CLS.bulletHTML}</td>
        <td>${item.score}</td>
      </tr>`;
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
  
  static getBulletHTML(score){
    switch (true) {
      case (score <= 59):
        return `<span class="icon-fail" title="${score}"></span>`;
        break;
      case (score > 59 && score <= 89):
        return `<span class="icon-medium" title="${score}"></span>`;
        break;
      case (score > 89):
        return `<span class="icon-pass" title="${score}"></span>`;
        break;
      default:
        return '';
        break;
    }
  }
  
  static getFormattedScore(score){
    switch (true) {
      case (score <= 59):
        return `<span class="text-fail">${score}</span>`;
        break;
      case (score > 59 && score <= 89):
        return `<span class="text-medium">${score}</span>`;
        break;
      case (score > 89):
        return `<span class="text-pass">${score}</span>`;
        break;
      default:
        return '';
        break;
    }
  }
  
}

export default Lighthouse;
// https://github.com/GoogleChrome/lighthouse/blob/HEAD/docs/readme.md#using-programmatically
// https://leonardofaria.net/2020/11/30/the-undocumented-lighthouse-guide/
// https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/config/default-config.js

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
    let reportJSON = JSON.parse(runnerResult.report[1]);
    
    let row = {
      site: site,
      FCP: {
        score: Math.round(reportJSON.audits['first-contentful-paint'].score * 100, 0)
      },
      SI: {
        score: Math.round(reportJSON.audits['speed-index'].score * 100, 0)
      },
      LCP: {
        score: Math.round(reportJSON.audits['largest-contentful-paint'].score * 100, 0)
      },
      TBT: {
        score: Math.round(reportJSON.audits['total-blocking-time'].score * 100, 0)
      },
      CLS: {
        score: Math.round(reportJSON.audits['cumulative-layout-shift'].score * 100, 0)
      }
    };
    
    // row.reportFile = `${reportFile}.html`;
    this.output.push(row);
    
    if(this.sites.length){
      this.runLighthouse(this.sites.pop());
    }else{
      // this.exportHtml();
      await this.chrome.kill();
      this.end = Date.now();
      console.log('End: '+ this.end);
      console.log('Time elapsed (seconds): ' + Math.ceil((this.end - this.start)/1000));
    }
  }
  
  static urlToCode(url){
    const myURL = new URL(url);
    return myURL.hostname;
  }
  
}

Lighthouse.run();
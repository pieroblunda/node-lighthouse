# node lighthouse

Automating lighthouse reports

## Usage

```javascript
let LighthouseInstance = new Lighthouse(sites);
```
`sites` accepts to be an array, a string or null.

```javascript
// As string
let sites = 'https://www.example.com';
let LighthouseInstance = new Lighthouse(sites);
```

```javascript
// As arrayÂ
let sites = [
  'https://www.example.com',
  'https://www.foo.com',
  'https://www.bar.com'
];
let LighthouseInstance = new Lighthouse(sites);
```

```javascript
// As null
let LighthouseInstance = new Lighthouse();
```
When the input is null, it reads the file `input.txt`. You should to insert an URL on each line.


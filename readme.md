# node lighthouse

Automating lighthouse reports

## Usage

```javascript
Lighthouse.run(sites);
```
`sites` accepts to be an array, a string or null.

```javascript
// As string
let sites = 'https://www.example.com';
Lighthouse.run(sites);
```

```javascript
// As arrayÂ
let sites = [
  'https://www.example.com',
  'https://www.foo.com',
  'https://www.bar.com'
];
Lighthouse.run(sites);
```

```javascript
// As null
Lighthouse.run();
```
When the input is null, it reads the file `input.txt`. You should to insert an URL on each line.


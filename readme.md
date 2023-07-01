# node lighthouse

Automating lighthouse reports

## Usage

```
import Lighthouse from 'node-lighthouse';
```

```javascript
// Using string param
Lighthouse.run('https://stackoverflow.com');;
```

```javascript
// Using array param
let sites = [
  'https://github.com'
  'https://www.google.com'
];
Lighthouse.run(sites);
```

```javascript
// Using input.txt file as param
// When the input is null, it reads the file `input.txt`. You should to insert an URL on each line.
Lighthouse.run();
```


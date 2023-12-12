### Hi there 👋

```
const express = require('express');
const app = express();
const port = process.ENV.PORT || 8000;

class CloudComputing {
    constructor() {
        this.name = "Arrizal Bintang Ramadhan";
        this.role = "Software Engineer";
        this.languageSpoken = ["en_US", "id_ID", "ja_JP"];
    }

    sayHi() {
        return "Thanks for dropping by, hope you find something interesting.";
    }
}

app.get('/', (req, res) => {
    const me = new SoftwareEngineer();
    res.send(me.sayHi());
});

app.listen(port, () => {
    console.log(`we're running at full speed, grab your gears fellas, we are in http://localhost:${port}`);
});
```



const http = require('http');
const request = require('request');
const parseString = require('xml2js').parseString;

class Rate {
  constructor() {
    this.remoteData = undefined;
    this.currencies = [];
    this._getEndSymbol = undefined;
    this.rates = new Array(
      'USD',
      'EUR',
      'XDR',
      'CNY',
      'CHF',
      'RUB',
      'UZS',
      'KGS',
      'KZT',
      'BYN',
      'IRR',
      'AFN',
      'PKR',
      'TRY',
      'TMT',
      'GBP',
      'AUD',
      'DKK',
      'ISK',
      'CAD',
      'KWD',
      'NOK',
      'SGD',
      'SEK',
      'JPY',
      'AZN',
      'AMD',
      'GEL',
      'MDL',
      'UAH',
      'AED',
      'SAR',
      'INR',
      'PLN',
      'MYR',
      'THB'
    );
  }

  getRateFromNBT() {
    var promise = new Promise(function (resolve, reject) {
      request('http://nbt.tj/ru/kurs/export_xml.php?date=2018-04-16&export=xmlout', function (error, response, body) {
        parseString(body, function (err, result) {
          this.remoteData = result.ValCurs.Valute;
        }.bind(this));
        var i = 0;
        this.currencies = [];
        while (this.remoteData[i]) {
          this.currencies.push({
            id: parseInt(this.remoteData[i].$.ID),
            code: this.remoteData[i].CharCode[0],
            name: this.remoteData[i].Name[0],
            value: this.remoteData[i].Value[0],
          });
          i++;
        }
        resolve(this.currencies);
      }.bind(this));
    }.bind(this));
    return promise
  }
}
class Currencies extends Rate {

  getAllData(callback) {
    this.getRateFromNBT()
      .then(function (value) {
        callback(value);
      }.bind(this))
      .catch(function (err) {
        console.log(err)
      }.bind(this));
  }

  getRand(url) {
    let i = 0;
    while (this.rates[i]) {

      if (url == `/rate/${this.rates[i].toLowerCase()}`) {
        this._getEndSymbol = url;
        console.log('true');
        return this.rates[i].toLowerCase();
      }
      i++;
    }
  }

  routeData(url, callback) {

    let _url = url.toLowerCase();

    switch (_url) {
      case '/rate':
        this.getAllData(function (data) {
          callback(data);
        });
        break;

      case '/rate/' + this.getRand(_url):
        this.getAllData(function (data) {
          let i = 0;
          while (data[i]) {

            if (`/rate/${data[i].code.toLowerCase()}` == this._getEndSymbol) {
              callback(data[i]);
              break;
            }
            i++;
          }

        }.bind(this));
        break;
      default:
        callback({
          route: 'Error route. Please contact: +992888881808. Turaev Munis'
        });;
        break;
    }

  }


  runServer() {
    http.createServer(function (req, res) {
      this.routeData(req.url, function (data) {
        res.writeHead(200, {
          'content-type': 'application/json; charset=utf-8'
        });
        res.write(JSON.stringify(data));
        res.end();
      }.bind(this));
    }.bind(this)).listen(9090);
  }
}
let currencies = new Currencies();
currencies.runServer();
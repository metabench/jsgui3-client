class FakeXMLHttpRequest {
  static instances = [];

  static reset() {
    FakeXMLHttpRequest.instances.length = 0;
  }

  constructor() {
    this.method = undefined;
    this.url = undefined;
    this.async = undefined;
    this.timeout = 0;
    this.readyState = 0;
    this.status = 0;
    this.responseText = '';
    this.requestHeaders = Object.create(null);
    this.sentBody = undefined;
    this.onreadystatechange = null;
    FakeXMLHttpRequest.instances.push(this);
  }

  open(method, url, async = true) {
    this.method = method;
    this.url = url;
    this.async = async;
    this.readyState = 1;
  }

  setRequestHeader(name, value) {
    this.requestHeaders[String(name).toLowerCase()] = String(value);
  }

  send(body) {
    this.sentBody = body;
  }

  respond({ status = 200, responseText = '{}' } = {}) {
    this.status = status;
    this.responseText = responseText;
    this.readyState = 4;
    if (typeof this.onreadystatechange === 'function') this.onreadystatechange();
  }
}

module.exports = { FakeXMLHttpRequest };


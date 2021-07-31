const puppeteer = require("puppeteer");
const userFactory = require("../factories/userFactory");
const sessionFactory = require("../factories/sessionFactory");

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function (target, property) {
        return target[property] || browser[property] || page[property];
      },
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: "session", value: session });
    await this.page.setCookie({ name: "session.sig", value: sig });

    await this.page.goto("http://localhost:3000/blogs");

    await this.page.waitFor('a[href="/auth/logout"]');
  }

  getContentsOf(selector) {
    return this.page.$eval(selector, (elem) => elem.innerHTML);
  }

  get(path) {
    return this.page.evaluate(
      (_path) =>
        fetch(_path, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: "Heyyyaaa", content: "I CAN DO IT!" }),
        }).then((res) => res.json()),
      path
    );
  }

  post(path, data) {
    return this.page.evaluate(
      (props) =>
        fetch(props.path, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(props.data),
        }).then((res) => res.json()),
      { path, data }
    );
  }

  execRequests(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => this[method](path, data))
    );
  }
}

module.exports = CustomPage;

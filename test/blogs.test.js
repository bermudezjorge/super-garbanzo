const path = require("path");
const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  // await page.close();
});

describe("When logged in", async () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating");
  });

  test("can see blog create form", async () => {
    const label = await page.getContentsOf("form label");

    expect(label).toMatch("Blog Title");
  });

  describe("and using valid inputs", async () => {
    beforeEach(async () => {
      await page.type(".title input", "my title");
      await page.type(".content input", "my content");
      await page.click("form button");
    });

    test("submitting takes user to review screen", async () => {
      const text = await page.getContentsOf("form h5");

      expect(text).toEqual("Please confirm your entries");
    });

    test("submitting then saving adds blog to index page", async () => {
      await page.click("button.green");
      await page.waitFor(".card");

      const title = await page.getContentsOf(".card-title");
      const content = await page.getContentsOf("p");

      expect(title).toEqual("my title");
      expect(content).toEqual("my content");
    });

    test("submitting and adding blog image", async () => {
      const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.click("input[type=file]"),
      ]);
      const imgPath = path.join(
        path.resolve("client", "public"),
        "test_img.png"
      );
      await fileChooser.accept([imgPath]);

      await page.click("button.green");
      await page.waitFor(".card");

      await page.click(".card a");
      await page.waitFor("h3");

      const alt = await page.$eval("img", (elem) => elem.alt);
      const title = await page.getContentsOf("h3");
      const content = await page.getContentsOf("p");

      expect(alt).toEqual("blog post related");
      expect(title).toEqual("my title");
      expect(content).toEqual("my content");
    });
  });

  describe("and using invalid inputs", async () => {
    test("the form shows an error message", async () => {
      await page.click("form button");

      const titleError = await page.getContentsOf(".title .red-text");
      const contentError = await page.getContentsOf(".content .red-text");

      expect(titleError).toEqual("You must provide a value");
      expect(contentError).toEqual("You must provide a value");
    });
  });
});

describe("when user is not logged in", async () => {
  const actions = [
    {
      method: "get",
      path: "/api/blogs",
    },
    {
      method: "post",
      path: "/api/blogs",
      data: {
        title: "my data",
        content: "love data",
      },
    },
  ];

  test("blog related actions are prohibited", async () => {
    const allActions = await page.execRequests(actions);

    allActions.forEach((action) => {
      expect(action).toEqual({ error: "You must log in!" });
    });
  });
});

const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe.skip("In header", async () => {
  test("logo appears", async () => {
    const text = await page.getContentsOf("a.brand-logo");

    expect(text).toEqual("Blogster");
  });

  test("clicking login button starts oAuth flow", async () => {
    await page.click("li a");

    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/);
  });

  test("when sign-in shows logout button", async () => {
    await page.login();

    const text = await page.getContentsOf('a[href="/auth/logout"]');

    expect(text).toEqual("Logout");
  });
});

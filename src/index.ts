import { Hono } from "hono";
import { Octokit } from "octokit";
// import { env } from "node:process";

const app = new Hono();

// https://github.com/octokit/core.js#readme

app.get("/:username", async (c) => {
  const octokit = new Octokit({
    auth: c.env.GITHUB_TOKEN,
  });
  let resp: any = await octokit.graphql(
    `
    query pinnedRepos($owner: String!) {
  user(login: $owner) {
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on RepositoryInfo {
          name
          description
          url
          createdAt
          updatedAt
        }
      }
    }
  }
}
    `,
    {
      owner: c.req.param("username"),
    },
  );

  // console.log(JSON.stringify(resp));
  return c.json(resp.user.pinnedItems.nodes);
});

// app.get("/", (c) => c.text("Hello CF Workers"));

app.notFound((c) => {
  return c.text("Oopsie: Nothing here", 404);
});

app.onError((err, c) => {
  console.error(`${err}`);
  return c.text("Something went wrong :/", 500);
});

export default app;

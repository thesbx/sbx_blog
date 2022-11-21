import { cache } from "react";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import {frontmatter, frontmatterHtml} from 'micromark-extension-frontmatter'

type Post = {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  _links: object;
}

const getPosts = async () => {
    const res = await fetch(process.env.GITHUB_ENDPOINT, {
      headers: {
        Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      },
    });
    return res.json();
};

const getPostDownloadURL = async (slug: string) => {
    const post = await getPosts()
    .then((response) => {
      return response.find((post: Post) => post.name === slug);
    })
    const res = await fetch(post.download_url);
    return res
}

const markdownToHtml = async(markdown: string) => {
  const result = micromark(markdown, {
    extensions: [gfm()],
    htmlExtensions: [gfmHtml()],
  });
  return result;
}

const getMarkdownByPost = async (slug: string) => {
  const post = await getPostDownloadURL(`${slug}.md`)
  .then(async (response) => {
    const markdown = markdownToHtml(await response.text()) 
    return markdown
  })
  return post;
}

const getMarkdown = async () => {
  const posts = await getPosts();
  const payload = await Promise.all(posts.map(async (post: Post) => {
    const res = await fetch(post.download_url);
    const markdown = await markdownToHtml(await res.text())
    return markdown;
  }));
  return payload;
}

export {getPosts, getMarkdownByPost, getMarkdown}
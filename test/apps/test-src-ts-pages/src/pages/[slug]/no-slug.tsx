export async function getStaticPaths() {
  return Promise.resolve({
    paths: [
      {
        params: {
          slug: "slug-path-1",
          lastModified: new Date(0),
        },
      },
      {
        params: {
          slug: "slug-path2",
        },
      },
    ],
    fallback: false,
  });
}

export async function getStaticProps() {
  return Promise.resolve({
    props: {},
  });
}

export default function Slug() {
  return <></>;
}

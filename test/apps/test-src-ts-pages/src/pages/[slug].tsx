export async function getStaticPaths() {
  return Promise.resolve({
    paths: [
      {
        params: {
          slug: "such-a-slug",
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

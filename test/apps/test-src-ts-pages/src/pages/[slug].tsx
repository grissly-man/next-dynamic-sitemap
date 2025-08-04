import "material-symbols";
import "../styles/globals.css";
import img from "../assets/alien-svgrepo-com.svg";
import Image from "next/image";

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
  return <Image src={img} alt={"My Alien"}></Image>;
}

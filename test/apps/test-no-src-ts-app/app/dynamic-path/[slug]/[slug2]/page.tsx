export function generateStaticParams() {
  return [
    {
      slug: "page-1",
      slug2: "sub-page-1",
    },
    {
      slug: "page-2",
      slug2: "sub-page-2",
      lastModified: new Date(0),
    },
  ];
}

export default function DynamicPathPage() {}

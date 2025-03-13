import { Helmet } from "react-helmet-async";

export const SEO = ({ title, description, keywords, image }) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    {image && <meta property="og:image" content={image} />}
  </Helmet>
);

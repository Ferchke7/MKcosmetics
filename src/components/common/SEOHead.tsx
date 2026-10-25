import React, { useEffect } from 'react';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonical,
  image,
  type = 'website',
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Title
    if (title) {
      document.title = title;
    }

    // Helper to set or create meta tag
    const setMeta = (attrName: string, attrVal: string, content: string) => {
      let elem = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!elem) {
        elem = document.createElement('meta');
        elem.setAttribute(attrName, attrVal);
        document.head.appendChild(elem);
      }
      elem.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }

    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }

    if (title) {
      setMeta('property', 'og:title', title);
      setMeta('name', 'twitter:title', title);
    }

    setMeta('property', 'og:type', type);

    // 3. Image
    const defaultImage = 'https://mkkoreacosmetic.com/logo.png';
    const finalImage = image ? (image.startsWith('/') ? `https://mkkoreacosmetic.com${image}` : image) : defaultImage;
    setMeta('property', 'og:image', finalImage);
    setMeta('name', 'twitter:image', finalImage);
    setMeta('name', 'twitter:card', 'summary_large_image');

    // 4. Canonical
    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonical);
      setMeta('property', 'og:url', canonical);
    }

    // 5. Dynamic JSON-LD Structured Data
    // Remove old dynamic JSON-LD scripts
    const oldScripts = document.querySelectorAll('script[data-seo="dynamic"]');
    oldScripts.forEach((s) => s.remove());

    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      items.forEach((item) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo', 'dynamic');
        script.textContent = JSON.stringify(item);
        document.head.appendChild(script);
      });
    }

    return () => {
      // Cleanup injected dynamic JSON-LD on unmount
      const scripts = document.querySelectorAll('script[data-seo="dynamic"]');
      scripts.forEach((s) => s.remove());
    };
  }, [title, description, keywords, canonical, image, type, jsonLd]);

  return null;
};

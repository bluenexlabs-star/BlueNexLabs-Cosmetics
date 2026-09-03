import { productDescriptionToHtml } from "@/lib/markdown";
import { splitProductDescriptionHtml } from "@/lib/product-description-sections";

function Chevron() {
  return (
    <svg
      className="product-desc-chevron"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6.25 8 10.25 12 6.25"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProductDescription({ markdown }: { markdown: string }) {
  const html = productDescriptionToHtml(markdown);
  const { preambleHtml, sections } = splitProductDescriptionHtml(html);

  if (sections.length < 2) {
    return (
      <div
        className="prose-product mt-4 max-w-none text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="product-desc mt-4">
      {preambleHtml ? (
        <div
          className="prose-product mb-3 max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: preambleHtml }}
        />
      ) : null}
      <div className="product-desc-accordion">
        {sections.map((section, index) => (
          <details
            key={`${section.headingTag}-${index}`}
            className="product-desc-section"
          >
            <summary className="product-desc-summary">
              <span
                className="product-desc-summary-text"
                dangerouslySetInnerHTML={{
                  __html: `<${section.headingTag}>${section.headingHtml}</${section.headingTag}>`,
                }}
              />
              <Chevron />
            </summary>
            {section.bodyHtml ? (
              <div
                className="prose-product product-desc-body max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
              />
            ) : null}
          </details>
        ))}
      </div>
    </div>
  );
}

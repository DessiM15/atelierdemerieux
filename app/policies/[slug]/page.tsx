import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPolicy, policies } from "@/lib/policies";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return policies.map((policy) => ({ slug: policy.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) return { title: "Not found" };
  return { title: policy.title, description: policy.summary };
}

export default async function PolicyPage({ params }: PageProps) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  return (
    <div className="shell-narrow pt-12 sm:pt-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/policies"
          className="text-[0.75rem] uppercase tracking-[0.16em] text-muted underline-offset-4 hover:underline"
        >
          All policies
        </Link>
      </nav>

      <header className="border-b border-rule pb-8">
        <h1 className="display-xl">{policy.title}</h1>
        <p className="prose-editorial mt-5 text-muted">{policy.summary}</p>
        <p className="mt-5 text-[0.8125rem] text-muted">Last updated {policy.updated}</p>
      </header>

      <div className="flex flex-col gap-10 pt-10">
        {policy.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="display-sm mb-3">{section.heading}</h2>
            <div className="flex flex-col gap-3.5">
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} className="max-w-[68ch] text-[1.0625rem] leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
            {section.bullets ? (
              <ul className="mt-4 flex max-w-[68ch] flex-col gap-2.5">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="grid grid-cols-[1rem_1fr] gap-3 text-[1.0625rem] leading-relaxed text-muted">
                    <span aria-hidden="true" className="pt-2.5">
                      <span className="block h-px w-3 bg-camel" />
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <nav aria-label="Other policies" className="mt-16 border-t border-rule pt-8">
        <h2 className="eyebrow mb-4">Also worth reading</h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {policies
            .filter((entry) => entry.slug !== policy.slug)
            .map((entry) => (
              <li key={entry.slug}>
                <Link href={`/policies/${entry.slug}`} className="link text-[0.9375rem]">
                  {entry.title}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </div>
  );
}

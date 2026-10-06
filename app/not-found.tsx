import Link from "next/link";
import { StitchGlyph } from "@/components/wordmark";

export default function NotFound() {
  return (
    <div className="shell-narrow flex flex-col items-start gap-6 py-24 sm:py-32">
      <StitchGlyph className="h-7 w-auto text-camel" loops={3} />
      <h1 className="display-xl">This one got away.</h1>
      <p className="prose-editorial text-muted">
        The page you were after is not here. It may have been a one-of-a-kind piece that has already
        sold, or the address may have a typo in it.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/shop" className="btn btn-primary">
          Shop the atelier
        </Link>
        <Link href="/" className="btn btn-secondary">
          Back to the start
        </Link>
      </div>
    </div>
  );
}

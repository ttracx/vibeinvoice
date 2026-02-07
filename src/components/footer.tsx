import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                VI
              </div>
              <span className="font-semibold">VibeInvoice</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center justify-center gap-4 border-t pt-8">
          <div className="flex items-center gap-4">
            <a href="https://vibecaas.com" target="_blank" rel="noopener noreferrer">
              <Image
                src="https://vibecaas.com/assets/VibeCaaSIcon_1754083072925-B9dmwIle.png"
                alt="VibeCaaS"
                width={32}
                height={32}
                className="rounded"
              />
            </a>
            <a href="https://www.neuralquantum.ai" target="_blank" rel="noopener noreferrer">
              <Image
                src="https://www.neuralquantum.ai/assets/logo-with-text.png"
                alt="NeuralQuantum.ai"
                width={140}
                height={32}
                className="h-8 w-auto"
              />
            </a>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © 2026 VibeInvoice powered by{" "}
            <a
              href="https://vibecaas.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              VibeCaaS.com
            </a>{" "}
            a division of{" "}
            <a
              href="https://www.neuralquantum.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              NeuralQuantum.ai LLC
            </a>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

import Image from "next/image";
import type { PartnerCompany } from "@/lib/experience/types";

type CompaniesStripProps = {
  companies: PartnerCompany[];
};

// The logos of the companies worked with, in a single row from lg up (two
// rows of five on smaller screens), drawn as a grid of hairlines. Each cell
// holds the company's name until its real logo exists.
export function CompaniesStrip({ companies }: CompaniesStripProps) {
  return (
    <ul className="grid grid-cols-5 gap-px border border-neutral-200 bg-neutral-200 lg:grid-cols-10">
      {companies.map((company) => (
        <li
          key={company.id}
          className="relative flex aspect-[3/2] items-center justify-center bg-primary"
        >
          {company.logo ? (
            <Image
              src={company.logo}
              alt={company.name}
              fill
              sizes="(min-width: 1024px) 10vw, 20vw"
              className="object-contain p-3"
            />
          ) : (
            <span className="px-1 text-center text-[10px] leading-tight text-neutral-400">
              {company.name}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

import { getCompanies } from "@/utils/db-queries/company";
import CreateCompanyButton from "./_components/create-company-button";
import Companies from "./_components/companies";

export default async function CompaniesPage() {
  try {
    const companies = await getCompanies();
    return (
      <div>
        <div className="flex w-full justify-end">
          <CreateCompanyButton />
        </div>
        <Companies companies={companies} />
      </div>
    );
  } catch (error) {
    return <p className="p-24">Error fetching companies</p>;
  }
}

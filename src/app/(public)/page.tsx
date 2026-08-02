import { About } from "@/components/public/About";
import { BestSellers } from "@/components/public/BestSellers";
import { Contact } from "@/components/public/Contact";
import { Hero } from "@/components/public/Hero";

const Page = () => {
  return (
    <div>
      <Hero />
      <BestSellers />
      <About />
      <Contact />
    </div>
  );
};

export default Page;

import styles from "./page.module.css";
import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import Stats from "@/components/Stats/Stats";
import Tutorial from "@/components/Tutorial/Tutorial";
import LeversOfPower from "@/components/LeversOfPower/LeversOfPower";

export default function Home() {
  return (
    <main className={styles.main}>
      <Header />
      <Hero />
      <Stats />
      <LeversOfPower />
      <Tutorial />
    </main>
  );
}

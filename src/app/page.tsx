import styles from "./page.module.css";
import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import ElectionBanner from "@/components/ElectionBanner/ElectionBanner";
import ElectionDashboard from "@/components/ElectionDashboard/ElectionDashboard";
import Tutorial from "@/components/Tutorial/Tutorial";
import LeversOfPower from "@/components/LeversOfPower/LeversOfPower";

export default function Home() {
  return (
    <main className={styles.main}>
      <Header />
      <ElectionBanner />
      <Hero />
      <ElectionDashboard />
      <LeversOfPower />
      <Tutorial />
    </main>
  );
}

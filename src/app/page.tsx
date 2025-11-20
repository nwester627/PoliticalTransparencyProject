import styles from "./page.module.css";
import Hero from "@/components/Hero/Hero";
import ElectionDashboard from "@/components/ElectionDashboard/ElectionDashboard";
import Tutorial from "@/components/Tutorial/Tutorial";
import LeversOfPower from "@/components/LeversOfPower/LeversOfPower";

export default function Home() {
  return (
    <main className={styles.main}>
      <Hero />
      <ElectionDashboard />
      <LeversOfPower />
      <Tutorial />
    </main>
  );
}

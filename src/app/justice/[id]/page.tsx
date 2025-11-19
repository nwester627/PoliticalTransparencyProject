"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Card from "@/components/UI/Card/Card";
import Button from "@/components/UI/Button/Button";
import Image from "next/image";
import {
  FaRepublican,
  FaDemocrat,
  FaPhone,
  FaGlobe,
  FaArrowLeft,
  FaFileAlt,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { SUPREME_COURT_JUSTICES } from "@/utils/supremeCourtData";
import styles from "./page.module.css";

export default function JusticePage() {
  const params = useParams();
  const justiceId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [justice, setJustice] = useState<any>(null);

  useEffect(() => {
    // Find the justice by name (URL parameter)
    const justiceSlug = decodeURIComponent(justiceId);
    const foundJustice = SUPREME_COURT_JUSTICES.find((j) => {
      const slug = j.name.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "");
      return slug === justiceSlug;
    });
    setJustice(foundJustice);
    setLoading(false);
  }, [justiceId]);

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return "";
    const birthYear = parseInt(birthdate.split(", ")[1]);
    return (2025 - birthYear).toString();
  };

  if (loading) {
    return (
      <>
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.loading}>Loading...</div>
          </div>
        </main>
      </>
    );
  }

  if (!justice) {
    return (
      <>
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.notFound}>Justice not found</div>
          </div>
        </main>
      </>
    );
  }

  const justiceTitle =
    justice.title === "Chief Justice"
      ? "Chief Justice of the United States"
      : "Associate Justice of the United States";

  const partyClass =
    justice.party === "Republican" ? styles.republican : styles.democrat;
  const PartyIcon = justice.party === "Republican" ? FaRepublican : FaDemocrat;

  return (
    <>
      <main className={styles.main}>
        <div className={styles.container}>
          <Button
            onClick={() => window.history.back()}
            className={styles.backButton}
          >
            <FaArrowLeft /> Back
          </Button>

          <div className={`${styles.profileBanner} ${partyClass}`}>
            <div className={styles.bannerSeal}>
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/f/f3/Seal_of_the_United_States_Supreme_Court.svg"
                alt="Seal of the Supreme Court"
                className={styles.bannerSealImage}
                width={80}
                height={80}
                sizes="(max-width: 480px) 45px, (max-width: 520px) 50px, (max-width: 768px) 60px, 80px"
                unoptimized
              />
            </div>
            <div className={styles.bannerTitle}>
              <div className={styles.bannerName}>{justice.name}</div>
              <div className={styles.bannerSubtitle}>{justiceTitle}</div>
            </div>
            <div className={`${styles.bannerIcon} ${partyClass}`}>
              <PartyIcon size={24} />
            </div>
          </div>

          <div className={`${styles.profileHeader} ${partyClass}`}>
            <div className={styles.profileImage}>
              <Image
                src={justice.imageUrl}
                alt={justice.name}
                width={200}
                height={200}
                className={styles.image}
                unoptimized
              />
            </div>
            <div className={styles.profileInfo}>
              <div className={styles.leftSection}>
                <h1 className={styles.memberName}>{justice.name}</h1>
                <p className={styles.memberTitle}>{justiceTitle}</p>
                <div className={styles.badgesContainer}>
                  <div className={`${styles.partyBadge} ${partyClass}`}>
                    <PartyIcon size={16} />
                    {justice.party}
                  </div>
                </div>
              </div>
              <div className={styles.rightSection}>
                <div className={styles.contactInfo}>
                  <div className={styles.contactItem}>
                    <FaBirthdayCake />
                    <span>
                      Born: {justice.birthdate || "Unknown"}
                      {justice.birthdate
                        ? ` (${calculateAge(justice.birthdate)})`
                        : ""}
                    </span>
                  </div>
                  <div className={styles.contactItem}>
                    <FaCalendarAlt />
                    <span>Appointed: {justice.confirmed}</span>
                  </div>
                  <div className={styles.contactItem}>
                    <FaMapMarkerAlt />
                    <span>Appointed by: {justice.appointedBy}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.profileGrid}>
            <article className={`${styles.statsCard} ${styles.wideCard}`}>
              <h3 className={styles.sectionTitle}>Biography</h3>
              <div className={styles.bioDetails}>
                {justice.name === "John G. Roberts Jr." ? (
                  <>
                    <p>
                      John Glover Roberts Jr. is the 17th Chief Justice of the
                      United States Supreme Court, appointed by President George
                      W. Bush in 2005. Born in Buffalo, New York, in 1955,
                      Roberts graduated from Harvard College and Harvard Law
                      School, where he served as managing editor of the Harvard
                      Law Review.
                    </p>
                    <p>
                      Before his Supreme Court appointment, Roberts served as a
                      law clerk for Judge Henry Friendly and Justice William
                      Rehnquist, worked in private practice, and held positions
                      in the Reagan and George H.W. Bush administrations,
                      including as Principal Deputy Solicitor General. He was
                      nominated to the D.C. Circuit Court of Appeals in 2001 and
                      elevated to Chief Justice in 2005 after the withdrawal of
                      Harriet Miers' nomination.
                    </p>
                    <p>
                      Known for his judicial conservatism and emphasis on
                      judicial restraint, Roberts has authored numerous landmark
                      decisions and is often seen as a swing vote on the Court.
                      He has served as Chief Justice during a period of
                      significant constitutional change.
                    </p>
                  </>
                ) : justice.name === "Clarence Thomas" ? (
                  <>
                    <p>
                      Clarence Thomas is an Associate Justice of the United
                      States Supreme Court, appointed by President George H.W.
                      Bush in 1991. Born in Pin Point, Georgia, in 1948, Thomas
                      overcame poverty and racial segregation to attend the
                      College of the Holy Cross and Yale Law School, where he
                      graduated in 1974.
                    </p>
                    <p>
                      Before his Supreme Court appointment, Thomas served as
                      Assistant Secretary of Education under President Reagan,
                      Chairman of the Equal Employment Opportunity Commission
                      (EEOC), and as a judge on the U.S. Court of Appeals for
                      the D.C. Circuit from 1990 to 1991. He is the second
                      African American to serve on the Supreme Court and has
                      been the longest-serving current Justice since Anthony
                      Kennedy's retirement in 2018.
                    </p>
                    <p>
                      Known for his conservative jurisprudence and originalist
                      approach to constitutional interpretation, Thomas
                      advocates for limited government, individual liberty, and
                      strict adherence to the text of the Constitution. He has
                      authored numerous opinions emphasizing federalism and
                      individual rights.
                    </p>
                  </>
                ) : justice.name === "Samuel A. Alito Jr." ? (
                  <>
                    <p>
                      Samuel Anthony Alito Jr. is an Associate Justice of the
                      United States Supreme Court, appointed by President George
                      W. Bush in 2006. Born in Trenton, New Jersey, in 1950,
                      Alito graduated from Princeton University with a degree in
                      politics and earned his law degree from Yale Law School in
                      1975.
                    </p>
                    <p>
                      Before his Supreme Court appointment, Alito served as a
                      law clerk for Judge Leonard I. Garth on the Third Circuit,
                      worked in private practice, served as U.S. Attorney for
                      the District of New Jersey, and was Assistant to the
                      Solicitor General. He served as a judge on the U.S. Court
                      of Appeals for the Third Circuit from 1990 to 2006.
                    </p>
                    <p>
                      Known for his conservative judicial philosophy, Alito
                      emphasizes textualism, precedent, and judicial restraint.
                      He has authored numerous opinions on issues including
                      abortion rights, gun control, religious liberty, and
                      criminal procedure, often aligning with conservative
                      positions on these matters.
                    </p>
                  </>
                ) : justice.name === "Sonia Sotomayor" ? (
                  <>
                    <p>
                      Sonia Sotomayor is an Associate Justice of the United
                      States Supreme Court, appointed by President Barack Obama
                      in 2009. Born in the Bronx, New York, in 1954, Sotomayor
                      grew up in a public housing project and was raised by her
                      mother after her father's death. She graduated from
                      Princeton University with a degree in history and earned
                      her law degree from Yale Law School in 1979.
                    </p>
                    <p>
                      Before her Supreme Court appointment, Sotomayor served as
                      an Assistant District Attorney in Manhattan, worked in
                      private practice, and was appointed to the U.S. District
                      Court for the Southern District of New York by President
                      George H.W. Bush. She was elevated to the U.S. Court of
                      Appeals for the Second Circuit by President Bill Clinton
                      in 1998.
                    </p>
                    <p>
                      As the first Hispanic Justice and third woman on the
                      Supreme Court, Sotomayor is known for her emphasis on
                      empathy, lived experience, and protecting the rights of
                      marginalized communities. Her jurisprudence often focuses
                      on issues of discrimination, criminal justice, and
                      constitutional protections for individuals.
                    </p>
                  </>
                ) : justice.name === "Elena Kagan" ? (
                  <>
                    <p>
                      Elena Kagan is an Associate Justice of the United States
                      Supreme Court, appointed by President Barack Obama in
                      2010. Born in New York City in 1960, Kagan grew up in a
                      politically active family and attended Hunter College High
                      School. She graduated summa cum laude from Princeton
                      University with a degree in government, earned an M.Phil.
                      in politics from Oxford University as a Marshall Scholar,
                      and received her J.D. from Harvard Law School in 1986.
                    </p>
                    <p>
                      Before her Supreme Court appointment, Kagan served as a
                      law clerk for Judge Abner Mikva and Justice Thurgood
                      Marshall, worked in private practice, and taught at the
                      University of Chicago Law School. She served as Dean of
                      Harvard Law School from 2003 to 2009 and as Solicitor
                      General of the United States from 2009 to 2010 under
                      President Obama.
                    </p>
                    <p>
                      As the fourth woman to serve on the Supreme Court, Kagan
                      is known for her expertise in administrative law, First
                      Amendment issues, and LGBT rights. Her jurisprudence
                      emphasizes careful analysis of precedent, statutory
                      interpretation, and protecting individual liberties while
                      respecting institutional constraints.
                    </p>
                  </>
                ) : justice.name === "Neil M. Gorsuch" ? (
                  <>
                    <p>
                      Neil Gorsuch is an Associate Justice of the United States
                      Supreme Court, appointed by President Donald Trump in
                      2017. Born in Denver, Colorado, in 1967, Gorsuch grew up
                      in a politically active family and attended Georgetown
                      Preparatory School. He graduated magna cum laude from
                      Columbia University with a B.A. in political science,
                      earned his J.D. from Harvard Law School, and received a
                      D.Phil. in legal philosophy from Oxford University as a
                      Marshall Scholar.
                    </p>
                    <p>
                      Before his Supreme Court appointment, Gorsuch served as a
                      law clerk for Judge David B. Sentelle on the D.C. Circuit
                      and for Justices Byron White and Anthony Kennedy on the
                      Supreme Court. He worked in private practice at Kellogg,
                      Hansen, Todd, Figel & Frederick and served as Principal
                      Deputy Associate Attorney General. He was appointed to the
                      U.S. Court of Appeals for the Tenth Circuit by President
                      George W. Bush in 2006.
                    </p>
                    <p>
                      Known for his conservative judicial philosophy, Gorsuch
                      emphasizes textualism, originalism, and skepticism toward
                      administrative agencies. He has authored numerous opinions
                      on issues including administrative law, criminal
                      procedure, and constitutional rights, often advocating for
                      limiting the scope of federal regulatory power.
                    </p>
                  </>
                ) : justice.name === "Brett M. Kavanaugh" ? (
                  <>
                    <p>
                      Brett Kavanaugh is an Associate Justice of the United
                      States Supreme Court, appointed by President Donald Trump
                      in 2018. Born in Washington, D.C., in 1965, Kavanaugh grew
                      up in Maryland and attended Georgetown Preparatory School.
                      He graduated summa cum laude from Yale College with a B.A.
                      in American history and earned his J.D. from Yale Law
                      School in 1990.
                    </p>
                    <p>
                      Before his Supreme Court appointment, Kavanaugh served as
                      a law clerk for Judge Walter Stapleton on the Third
                      Circuit and for Justice Anthony Kennedy on the Supreme
                      Court. He worked as a lawyer in private practice and
                      served in various government positions, including as White
                      House Staff Secretary under President George W. Bush. He
                      was appointed to the U.S. Court of Appeals for the D.C.
                      Circuit by President George W. Bush in 2006.
                    </p>
                    <p>
                      Known for his conservative judicial philosophy, Kavanaugh
                      emphasizes originalism, stare decisis, and judicial
                      restraint. He has authored numerous opinions on issues
                      including constitutional law, administrative law, and
                      criminal procedure, often focusing on protecting
                      individual rights and limiting government overreach.
                    </p>
                  </>
                ) : justice.name === "Amy Coney Barrett" ? (
                  <>
                    <p>
                      Amy Coney Barrett is an Associate Justice of the United
                      States Supreme Court, appointed by President Donald Trump
                      in 2020. Born in New Orleans, Louisiana, in 1972, Barrett
                      grew up in a large Catholic family and attended St. Mary's
                      Dominican High School. She graduated magna cum laude from
                      Rhodes College with a B.A. in English literature and
                      earned her J.D. from Notre Dame Law School in 1997.
                    </p>
                    <p>
                      Before her Supreme Court appointment, Barrett served as a
                      law clerk for Judge Laurence Silberman on the D.C. Circuit
                      and for Justice Antonin Scalia on the Supreme Court. She
                      taught at Notre Dame Law School for 15 years, becoming the
                      Diane and M.O. Miller Research Chair of Law. She was
                      appointed to the U.S. Court of Appeals for the Seventh
                      Circuit by President Donald Trump in 2017.
                    </p>
                    <p>
                      As the fifth woman to serve on the Supreme Court, Barrett
                      is known for her conservative judicial philosophy,
                      emphasizing originalism, textualism, and Catholic social
                      teaching. She has authored numerous opinions on issues
                      including religious liberty, administrative law, and
                      constitutional rights, often focusing on protecting
                      individual liberties and limiting regulatory overreach.
                    </p>
                  </>
                ) : justice.name === "Ketanji Brown Jackson" ? (
                  <>
                    <p>
                      Ketanji Brown Jackson is an Associate Justice of the
                      United States Supreme Court, appointed by President Joe
                      Biden in 2022. Born in Washington, D.C., in 1970, Jackson
                      grew up in Miami, Florida, and attended Miami Palmetto
                      Senior High School. She graduated magna cum laude from
                      Harvard College with an A.B. in government and earned her
                      J.D. from Harvard Law School in 1996.
                    </p>
                    <p>
                      Before her Supreme Court appointment, Jackson served as a
                      law clerk for Judge Patti Saris on the District of
                      Massachusetts and worked as a public defender in the
                      District of Columbia. She served as Vice Chair of the U.S.
                      Sentencing Commission from 2010 to 2014 and was appointed
                      to the U.S. Court of Appeals for the D.C. Circuit by
                      President Barack Obama in 2021.
                    </p>
                    <p>
                      As the first Black woman to serve on the Supreme Court,
                      Jackson is known for her progressive judicial philosophy,
                      emphasizing criminal justice reform, equality, and
                      protecting individual rights. She has authored numerous
                      opinions on issues including sentencing, discrimination,
                      and constitutional rights, often focusing on addressing
                      systemic inequities in the justice system.
                    </p>
                  </>
                ) : (
                  <p>
                    {justice.name} serves as {justiceTitle.toLowerCase()} on the
                    United States Supreme Court. Appointed by President{" "}
                    {justice.appointedBy} and confirmed by the Senate on{" "}
                    {justice.confirmed}.
                  </p>
                )}
              </div>
            </article>

            <article className={styles.termsCard}>
              <h3 className={styles.sectionTitle}>Judicial Service</h3>
              <div className={styles.termsList}>
                <div
                  className={`${styles.termItem} ${partyClass} ${styles.currentTerm}`}
                >
                  <div className={styles.termHead}>
                    <div className={styles.termPills}>
                      <div className={`${styles.termPill} ${partyClass}`}>
                        {justice.title}
                      </div>
                    </div>
                  </div>
                  <div className={styles.termLabel}>
                    <div className={styles.termState}>U.S. Supreme Court</div>
                    <div className={styles.termYears}>
                      Since {justice.confirmed}
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className={styles.statsCard}>
              <h3 className={styles.sectionTitle}>Court Information</h3>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <FaMapMarkerAlt />
                  <span>1 First Street NE, Washington, DC 20543</span>
                </div>
                <div className={styles.contactItem}>
                  <FaPhone />
                  <span>Phone: 202-479-3000</span>
                </div>
                <div className={styles.contactItem}>
                  <FaGlobe />
                  <span>Website: supremecourt.gov</span>
                </div>
              </div>
            </article>

            <article className={`${styles.financesCard} ${styles.wideCard}`}>
              <h3 className={styles.sectionTitle}>Key Decisions</h3>
              <div className={styles.financesContent}>
                {justice.name === "John G. Roberts Jr." ? (
                  <>
                    <p>
                      As Chief Justice, John Roberts has authored or joined in
                      numerous landmark Supreme Court decisions that have shaped
                      American law:
                    </p>
                    <ul>
                      <li>
                        <strong>Bush v. Gore (2000):</strong> As a lower court
                        judge, Roberts ruled on aspects of the Florida recount,
                        contributing to the case that decided the 2000
                        presidential election.
                      </li>
                      <li>
                        <strong>Citizens United v. FEC (2010):</strong> Authored
                        the majority opinion striking down restrictions on
                        corporate and union spending in elections,
                        revolutionizing campaign finance law.
                      </li>
                      <li>
                        <strong>
                          National Federation of Independent Business v.
                          Sebelius (2012):
                        </strong>{" "}
                        Wrote the majority opinion upholding most of the
                        Affordable Care Act's individual mandate as a tax.
                      </li>
                      <li>
                        <strong>Obergefell v. Hodges (2015):</strong> Authored
                        the majority opinion establishing a constitutional right
                        to same-sex marriage nationwide.
                      </li>
                      <li>
                        <strong>Shelby County v. Holder (2013):</strong> Joined
                        the majority in striking down key provisions of the
                        Voting Rights Act of 1965.
                      </li>
                      <li>
                        <strong>King v. Burwell (2015):</strong> Authored the
                        majority opinion upholding federal subsidies for health
                        insurance purchased through exchanges established by the
                        federal government.
                      </li>
                    </ul>
                    <p>
                      Roberts' decisions often reflect a commitment to judicial
                      minimalism and respect for precedent, though he has shown
                      willingness to uphold progressive legislation when
                      statutory text allows.
                    </p>
                  </>
                ) : justice.name === "Clarence Thomas" ? (
                  <>
                    <p>
                      Justice Clarence Thomas has authored or joined in many
                      landmark Supreme Court decisions that have significantly
                      influenced American law, often emphasizing originalism and
                      federalism:
                    </p>
                    <ul>
                      <li>
                        <strong>Bush v. Gore (2000):</strong> Joined the
                        majority opinion that halted the Florida recount and
                        effectively decided the 2000 presidential election.
                      </li>
                      <li>
                        <strong>Citizens United v. FEC (2010):</strong> Joined
                        the majority in striking down restrictions on corporate
                        and union political spending, expanding First Amendment
                        protections.
                      </li>
                      <li>
                        <strong>
                          Dobbs v. Jackson Women's Health Organization (2022):
                        </strong>{" "}
                        Authored the majority opinion overturning Roe v. Wade
                        and Planned Parenthood v. Casey, returning abortion
                        regulation to the states.
                      </li>
                      <li>
                        <strong>Shelby County v. Holder (2013):</strong> Joined
                        the majority in invalidating Section 4 of the Voting
                        Rights Act of 1965, arguing it exceeded Congress's
                        authority.
                      </li>
                      <li>
                        <strong>McDonald v. Chicago (2010):</strong> Joined the
                        majority in holding that the Second Amendment's right to
                        keep and bear arms applies to state and local
                        governments.
                      </li>
                      <li>
                        <strong>
                          New York State Rifle & Pistol Association v. Bruen
                          (2022):
                        </strong>{" "}
                        Joined the majority in striking down New York's
                        concealed carry licensing regime, expanding Second
                        Amendment rights.
                      </li>
                    </ul>
                    <p>
                      Thomas's jurisprudence often focuses on textualism,
                      federalism, and protecting individual liberties from
                      government overreach. He has been a consistent advocate
                      for limiting the scope of federal power.
                    </p>
                  </>
                ) : justice.name === "Samuel A. Alito Jr." ? (
                  <>
                    <p>
                      Justice Samuel Alito has authored or joined in numerous
                      landmark Supreme Court decisions, often focusing on
                      conservative interpretations of the Constitution and
                      statutory law:
                    </p>
                    <ul>
                      <li>
                        <strong>Citizens United v. FEC (2010):</strong> Joined
                        the majority in striking down campaign finance
                        restrictions on corporations and unions.
                      </li>
                      <li>
                        <strong>
                          Dobbs v. Jackson Women's Health Organization (2022):
                        </strong>{" "}
                        Joined the majority opinion overturning Roe v. Wade and
                        Planned Parenthood v. Casey.
                      </li>
                      <li>
                        <strong>Burwell v. Hobby Lobby Stores (2014):</strong>{" "}
                        Authored the majority opinion holding that closely held
                        corporations can be exempt from the contraceptive
                        mandate under the Religious Freedom Restoration Act.
                      </li>
                      <li>
                        <strong>McDonald v. Chicago (2010):</strong> Joined the
                        majority incorporating the Second Amendment against
                        state and local governments.
                      </li>
                      <li>
                        <strong>
                          Masterpiece Cakeshop v. Colorado Civil Rights
                          Commission (2018):
                        </strong>{" "}
                        Authored the majority opinion ruling that a state
                        commission violated a baker's free speech rights by
                        punishing him for declining to create a wedding cake for
                        a same-sex couple.
                      </li>
                      <li>
                        <strong>
                          New York State Rifle & Pistol Association v. Bruen
                          (2022):
                        </strong>{" "}
                        Joined the majority striking down New York's concealed
                        carry licensing law.
                      </li>
                    </ul>
                    <p>
                      Alito's opinions often emphasize judicial restraint,
                      textualism, and protection of individual rights, with a
                      particular focus on free speech, religious liberty, and
                      Second Amendment issues.
                    </p>
                  </>
                ) : justice.name === "Sonia Sotomayor" ? (
                  <>
                    <p>
                      Justice Sonia Sotomayor has authored or joined in numerous
                      landmark Supreme Court decisions, often focusing on
                      progressive interpretations of the Constitution,
                      particularly regarding civil rights, criminal justice, and
                      discrimination:
                    </p>
                    <ul>
                      <li>
                        <strong>Obergefell v. Hodges (2015):</strong> Joined the
                        majority opinion establishing a constitutional right to
                        same-sex marriage nationwide.
                      </li>
                      <li>
                        <strong>United States v. Windsor (2013):</strong> Joined
                        the majority in striking down the Defense of Marriage
                        Act (DOMA) as unconstitutional.
                      </li>
                      <li>
                        <strong>
                          Whole Woman's Health v. Hellerstedt (2016):
                        </strong>{" "}
                        Authored the majority opinion striking down Texas
                        restrictions on abortion providers that imposed an undue
                        burden on women's access to abortion.
                      </li>
                      <li>
                        <strong>
                          Schuette v. Coalition to Defend Affirmative Action
                          (2014):
                        </strong>{" "}
                        Dissented from the majority opinion upholding Michigan's
                        ban on affirmative action in university admissions.
                      </li>
                      <li>
                        <strong>Utah v. Strieff (2016):</strong> Authored the
                        majority opinion establishing an attenuation doctrine
                        for the exclusionary rule in Fourth Amendment cases.
                      </li>
                      <li>
                        <strong>Ramos v. Louisiana (2020):</strong> Joined the
                        majority opinion requiring unanimous jury verdicts in
                        state criminal trials.
                      </li>
                    </ul>
                    <p>
                      Sotomayor's decisions often reflect a commitment to
                      protecting individual rights, addressing systemic
                      discrimination, and ensuring equal justice under the law,
                      drawing from her own experiences as a Latina woman.
                    </p>
                  </>
                ) : justice.name === "Elena Kagan" ? (
                  <>
                    <p>
                      Justice Elena Kagan has authored or joined in numerous
                      landmark Supreme Court decisions, often focusing on
                      progressive interpretations of constitutional and
                      statutory law, with particular expertise in administrative
                      law and First Amendment issues:
                    </p>
                    <ul>
                      <li>
                        <strong>Obergefell v. Hodges (2015):</strong> Joined the
                        majority opinion establishing a constitutional right to
                        same-sex marriage nationwide.
                      </li>
                      <li>
                        <strong>United States v. Windsor (2013):</strong> Joined
                        the majority in striking down the Defense of Marriage
                        Act (DOMA) as unconstitutional.
                      </li>
                      <li>
                        <strong>King v. Burwell (2015):</strong> Joined the
                        majority opinion upholding federal subsidies for health
                        insurance purchased through exchanges established by the
                        federal government.
                      </li>
                      <li>
                        <strong>
                          Whole Woman's Health v. Hellerstedt (2016):
                        </strong>{" "}
                        Joined the majority opinion striking down Texas
                        restrictions on abortion providers.
                      </li>
                      <li>
                        <strong>Sessions v. Morales-Santana (2017):</strong>{" "}
                        Authored the majority opinion holding that gender-based
                        distinctions in citizenship laws violate the Fifth
                        Amendment's equal protection guarantee.
                      </li>
                      <li>
                        <strong>Bostock v. Clayton County (2020):</strong>{" "}
                        Joined the majority opinion interpreting Title VII of
                        the Civil Rights Act to prohibit employment
                        discrimination based on sexual orientation and gender
                        identity.
                      </li>
                    </ul>
                    <p>
                      Kagan's opinions often reflect a commitment to textualism
                      in statutory interpretation, deference to administrative
                      agencies, and protecting individual rights, with a
                      particular focus on equality and non-discrimination.
                    </p>
                  </>
                ) : justice.name === "Neil M. Gorsuch" ? (
                  <>
                    <p>
                      Justice Neil Gorsuch has authored or joined in numerous
                      landmark Supreme Court decisions, often focusing on
                      conservative interpretations of the Constitution and
                      statutory law, with particular emphasis on limiting
                      administrative power and protecting individual rights:
                    </p>
                    <ul>
                      <li>
                        <strong>Bostock v. Clayton County (2020):</strong>{" "}
                        Dissented from the majority opinion interpreting Title
                        VII to prohibit employment discrimination based on
                        sexual orientation and gender identity.
                      </li>
                      <li>
                        <strong>
                          New York State Rifle & Pistol Association v. Bruen
                          (2022):
                        </strong>{" "}
                        Joined the majority opinion striking down New York's
                        concealed carry licensing regime, expanding Second
                        Amendment rights.
                      </li>
                      <li>
                        <strong>
                          Dobbs v. Jackson Women's Health Organization (2022):
                        </strong>{" "}
                        Joined the majority opinion overturning Roe v. Wade and
                        Planned Parenthood v. Casey.
                      </li>
                      <li>
                        <strong>United States v. Rahimi (2024):</strong>{" "}
                        Authored the majority opinion upholding federal
                        restrictions on firearm possession by individuals
                        subject to domestic violence restraining orders.
                      </li>
                      <li>
                        <strong>
                          Loper Bright Enterprises v. Raimondo (2024):
                        </strong>{" "}
                        Authored the majority opinion overturning Chevron
                        deference, requiring courts to exercise independent
                        judgment in interpreting ambiguous statutes.
                      </li>
                      <li>
                        <strong>Trump v. United States (2024):</strong> Joined
                        the majority opinion recognizing absolute immunity for
                        official acts taken in an official capacity by the
                        President.
                      </li>
                    </ul>
                    <p>
                      Gorsuch's decisions often reflect a commitment to
                      textualism, originalism, and judicial restraint, with a
                      particular focus on administrative law reform and
                      protecting constitutional rights from regulatory
                      overreach.
                    </p>
                  </>
                ) : justice.name === "Brett M. Kavanaugh" ? (
                  <>
                    <p>
                      Justice Brett Kavanaugh has authored or joined in numerous
                      landmark Supreme Court decisions, often focusing on
                      conservative interpretations of the Constitution and
                      statutory law, with particular emphasis on originalism and
                      protecting individual rights:
                    </p>
                    <ul>
                      <li>
                        <strong>
                          Dobbs v. Jackson Women's Health Organization (2022):
                        </strong>{" "}
                        Joined the majority opinion overturning Roe v. Wade and
                        Planned Parenthood v. Casey.
                      </li>
                      <li>
                        <strong>
                          New York State Rifle & Pistol Association v. Bruen
                          (2022):
                        </strong>{" "}
                        Joined the majority opinion striking down New York's
                        concealed carry licensing regime, expanding Second
                        Amendment rights.
                      </li>
                      <li>
                        <strong>Bostock v. Clayton County (2020):</strong>{" "}
                        Dissented from the majority opinion interpreting Title
                        VII to prohibit employment discrimination based on
                        sexual orientation and gender identity.
                      </li>
                      <li>
                        <strong>Trump v. United States (2024):</strong> Joined
                        the majority opinion recognizing absolute immunity for
                        official acts taken in an official capacity by the
                        President.
                      </li>
                      <li>
                        <strong>Garland v. Cargill (2024):</strong> Authored the
                        majority opinion upholding the federal ban on bump
                        stocks as machine guns under the National Firearms Act.
                      </li>
                      <li>
                        <strong>Fischer v. United States (2024):</strong>{" "}
                        Authored the majority opinion narrowing the right-to-
                        counsel obstruction statute to require proof of corrupt
                        intent.
                      </li>
                    </ul>
                    <p>
                      Kavanaugh's decisions often reflect a commitment to
                      originalism, judicial restraint, and protecting
                      constitutional rights, with a particular focus on Second
                      Amendment issues, executive power, and criminal law.
                    </p>
                  </>
                ) : justice.name === "Amy Coney Barrett" ? (
                  <>
                    <p>
                      Justice Amy Coney Barrett has authored or joined in
                      numerous landmark Supreme Court decisions, often focusing
                      on conservative interpretations of the Constitution and
                      statutory law, with particular emphasis on originalism,
                      religious liberty, and limiting administrative power:
                    </p>
                    <ul>
                      <li>
                        <strong>
                          Dobbs v. Jackson Women's Health Organization (2022):
                        </strong>{" "}
                        Joined the majority opinion overturning Roe v. Wade and
                        Planned Parenthood v. Casey.
                      </li>
                      <li>
                        <strong>
                          New York State Rifle & Pistol Association v. Bruen
                          (2022):
                        </strong>{" "}
                        Joined the majority opinion striking down New York's
                        concealed carry licensing regime, expanding Second
                        Amendment rights.
                      </li>
                      <li>
                        <strong>Bostock v. Clayton County (2020):</strong>{" "}
                        Dissented from the majority opinion interpreting Title
                        VII to prohibit employment discrimination based on
                        sexual orientation and gender identity.
                      </li>
                      <li>
                        <strong>Trump v. United States (2024):</strong> Joined
                        the majority opinion recognizing absolute immunity for
                        official acts taken in an official capacity by the
                        President.
                      </li>
                      <li>
                        <strong>United States v. Rahimi (2024):</strong> Joined
                        the majority opinion upholding federal restrictions on
                        firearm possession by individuals subject to domestic
                        violence restraining orders.
                      </li>
                      <li>
                        <strong>
                          Loper Bright Enterprises v. Raimondo (2024):
                        </strong>{" "}
                        Joined the majority opinion overturning Chevron
                        deference, requiring courts to exercise independent
                        judgment in interpreting ambiguous statutes.
                      </li>
                    </ul>
                    <p>
                      Barrett's decisions often reflect a commitment to
                      originalism, textualism, and protecting religious liberty,
                      with a particular focus on administrative law reform and
                      constitutional rights.
                    </p>
                  </>
                ) : justice.name === "Ketanji Brown Jackson" ? (
                  <>
                    <p>
                      Justice Ketanji Brown Jackson has authored or joined in
                      numerous landmark Supreme Court decisions, often focusing
                      on progressive interpretations of the Constitution and
                      statutory law, with particular emphasis on criminal
                      justice reform, equality, and protecting individual
                      rights:
                    </p>
                    <ul>
                      <li>
                        <strong>Trump v. United States (2024):</strong>{" "}
                        Dissented from the majority opinion recognizing absolute
                        immunity for official acts taken in an official capacity
                        by the President.
                      </li>
                      <li>
                        <strong>Fischer v. United States (2024):</strong>{" "}
                        Dissented from the majority opinion narrowing the
                        right-to-counsel obstruction statute.
                      </li>
                      <li>
                        <strong>
                          Loper Bright Enterprises v. Raimondo (2024):
                        </strong>{" "}
                        Dissented from the majority opinion overturning Chevron
                        deference.
                      </li>
                      <li>
                        <strong>Garland v. Cargill (2024):</strong> Dissented
                        from the majority opinion upholding the federal ban on
                        bump stocks.
                      </li>
                      <li>
                        <strong>United States v. Rahimi (2024):</strong>{" "}
                        Dissented from the majority opinion upholding federal
                        restrictions on firearm possession by individuals
                        subject to domestic violence restraining orders.
                      </li>
                      <li>
                        <strong>
                          New York State Rifle & Pistol Association v. Bruen
                          (2022):
                        </strong>{" "}
                        Dissented from the majority opinion striking down New
                        York's concealed carry licensing regime.
                      </li>
                    </ul>
                    <p>
                      Jackson's decisions often reflect a commitment to
                      protecting individual rights, addressing systemic
                      discrimination, and ensuring equal justice under the law,
                      with a particular focus on criminal justice reform and
                      constitutional protections.
                    </p>
                  </>
                ) : (
                  <p>
                    Information about notable Supreme Court decisions and
                    judicial philosophy will be displayed here as they become
                    available.
                  </p>
                )}
              </div>
            </article>
          </div>
        </div>
      </main>
    </>
  );
}

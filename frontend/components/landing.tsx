import Image from "next/image";
import Link from "next/link";
import styles from "./landing.module.css";

export default function Landing() {
  return (
    <main className={styles.wrapper}>
      {/* HERO */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.hero}>
            <div className={styles.heroLeft}>
              <h1 className={styles.heroTitle}>
                Meningkatkan <br /> Kesehatan Mental
              </h1>

              <p className={styles.heroDesc}>
                Terapi hadir membantumu terhubung dengan konselor profesional
                secara mudah dan nyaman untuk menjaga kesehatan mentalmu.
              </p>

              <div className={styles.heroCtaRow}>
                <Link href="/appointment" className={styles.cta}>
                  Get Appointment
                </Link>
              </div>
            </div>

            <div className={styles.heroRight}>
              <div className={styles.heroArt}>
                <Image
                  src="/illustration-hero.png"
                  alt="Mental Health Illustration"
                  fill
                  priority
                  sizes="(max-width: 900px) 90vw, 460px"
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSIGHT */}
      <section className={styles.whiteSection}>
        <div className={styles.container}>
          <div className={styles.insight}>
            <h2 className={styles.sectionTitle}>
              Insight <br /> Menjaga Dirimu
            </h2>

            <div className={styles.insightRight}>
              <p className={styles.sectionDesc}>
                Semua orang butuh ruang untuk memahami diri. Di sini, kamu bisa
                menemukan insight yang menenangkan dan memberi pandangan baru.
              </p>

              <Link href="/self-help" className={styles.inlineLink}>
                Lihat Self-help <span aria-hidden>›</span>
              </Link>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureText}>
              <h3 className={styles.featureTitle}>Kenali Dirimu</h3>
              <p className={styles.featureDesc}>
                Mengenali diri adalah langkah awal untuk merasa lebih baik.
                Coba tes sederhana untuk tahu kondisi mentalmu saat ini.
              </p>

              <Link href="/self-assessment" className={styles.inlineLink}>
                Lihat Self-Assessment <span aria-hidden>›</span>
              </Link>
            </div>

            <div className={styles.featureArt}>
              <Image
                src="/insight-illustration.png"
                alt="Insight Illustration"
                width={280}
                height={210}
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* WAVE DI PALING BAWAH HALAMAN */}
      <div className={styles.pageWave} aria-hidden="true" />
    </main>
  );
}

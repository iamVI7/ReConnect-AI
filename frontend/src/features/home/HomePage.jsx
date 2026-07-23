import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Beacon from '../../components/common/Beacon.jsx';
import {
  FaUsers, FaUserShield, FaHospital, FaHandsHelping, FaBinoculars,
} from 'react-icons/fa';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const steps = [
  {
    n: '01',
    title: 'Someone is reported',
    body: 'A family reports a missing person, or a hospital, NGO, or police station registers someone found — photos, description, last known location.',
  },
  {
    n: '02',
    title: 'The AI scans continuously',
    body: 'Face, description, clothing, marks, location, and timeline are compared against every other record — not just once, but as new data arrives.',
  },
  {
    n: '03',
    title: 'A person verifies the match',
    body: 'Police or an administrator reviews the full reasoning behind every suggested match before anyone is contacted. No family hears from an algorithm.',
  },
  {
    n: '04',
    title: 'Families are reunited',
    body: 'A confirmed match closes the case, notifies everyone involved, and is recorded permanently in the audit trail.',
  },
];

const roles = [
  { icon: FaUsers, title: 'Families', body: 'Report a missing person, track progress, and get notified the moment a verified match is found.' },
  { icon: FaBinoculars, title: 'Citizens', body: 'Report sightings with a photo and location — anonymously, if you prefer.' },
  { icon: FaUserShield, title: 'Police', body: 'Review ranked AI matches with full explainability, verify or reject, and manage investigations.' },
  { icon: FaHospital, title: 'Hospitals', body: 'Register unidentified patients and keep medical status current and access-controlled.' },
  { icon: FaHandsHelping, title: 'NGOs & shelters', body: 'Register rescued individuals and track rehabilitation without duplicating paperwork.' },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.p variants={fadeUp} className="font-mono text-xs uppercase tracking-widest text-trust mb-4">
            Explainable AI · Every organization, one record
          </motion.p>
          <motion.h1 variants={fadeUp} className="font-display text-4xl sm:text-5xl leading-[1.08] mb-6">
            Every record is a chance to bring someone home.
          </motion.h1>
          <motion.p variants={fadeUp} className="text-ink-soft text-lg leading-relaxed mb-8 max-w-lg">
            Police, hospitals, NGOs, and families work from one shared picture instead of scattered
            paperwork — while AI quietly compares every case, and a person makes every final call.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
            <Link
              to="/report/missing-person"
              className="bg-trust text-paper px-6 py-3 rounded-full shadow-soft hover:bg-trust-deep transition-colors duration-200"
            >
              Report a missing person
            </Link>
            <Link
              to="/report/sighting"
              className="border border-line px-6 py-3 rounded-full hover:border-ink-faint hover:bg-paper-alt transition-colors duration-200"
            >
              Report a sighting
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="flex justify-center"
        >
          <Beacon />
        </motion.div>
      </section>

      {/* HOW IT WORKS — a real sequence, so numbering is earned */}
      <section id="how-it-works" className="bg-paper-alt border-y border-line">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="mb-14 max-w-xl"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-trust mb-3">How it works</p>
            <h2 className="font-display text-3xl">A process built around one rule: a human confirms every match.</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((s) => (
              <motion.div key={s.n} variants={fadeUp} className="relative">
                <span className="font-display text-3xl text-signal/70">{s.n}</span>
                <h3 className="font-display text-lg mt-3 mb-2">{s.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="mb-14 max-w-xl"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-trust mb-3">Who it serves</p>
          <h2 className="font-display text-3xl">One platform, five very different jobs.</h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {roles.map(({ icon: Icon, title, body }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-line bg-paper p-6 shadow-soft transition-shadow duration-300 hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-full bg-paper-alt flex items-center justify-center mb-4 text-trust group-hover:bg-signal-soft group-hover:text-signal transition-colors duration-300">
                <Icon size={16} />
              </div>
              <h3 className="font-display text-lg mb-2">{title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* TRUST STRIP */}
      <section id="trust" className="bg-trust text-paper">
        <div className="max-w-6xl mx-auto px-6 py-16 grid sm:grid-cols-3 gap-10">
          {[
            { label: 'Every match, explained', body: 'No black-box score — every factor behind a match is visible to the reviewer.' },
            { label: 'Human-verified, always', body: 'Families are never contacted by an algorithm. A person confirms first.' },
            { label: 'Consent-aware by design', body: 'Biometric data is stored as references, never raw, with tracked consent.' },
          ].map((t) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="font-display text-xl mb-2">{t.label}</p>
              <p className="text-sm text-paper/75 leading-relaxed">{t.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}

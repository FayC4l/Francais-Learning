// French conjugator: the three groups, irregular and defective verbs, every mood and tense, compound tenses with
// the agreement of the participle, pronominal verbs, negation and inversion with "-t-". Pure.
// Every form is an array of accepted spellings, the reference first (the 1990 spelling reform is accepted:
// « je cèderai », « il étiquète », « il paie / il paye »…; the circumflex on i / u is handled by answer.js).

export const PERSONS = ["je", "tu", "il", "nous", "vous", "ils"];
const REFL = ["me", "te", "se", "nous", "vous", "se"];
const STRESSED = ["moi", "toi", "soi", "nous", "vous", "soi"]; // imperative: lève-toi, levons-nous, levez-vous

export const TENSES = [
  { id: "present", fr: "présent de l'indicatif", short: "présent", mode: "indicatif", level: 1 },
  { id: "imparfait", fr: "imparfait de l'indicatif", short: "imparfait", mode: "indicatif", level: 3 },
  { id: "passe_simple", fr: "passé simple", short: "passé simple", mode: "indicatif", level: 5 },
  { id: "futur", fr: "futur simple", short: "futur", mode: "indicatif", level: 4 },
  { id: "passe_compose", fr: "passé composé", short: "passé composé", mode: "indicatif", aux: "present", level: 3 },
  { id: "plus_que_parfait", fr: "plus-que-parfait", short: "plus-que-parfait", mode: "indicatif", aux: "imparfait", level: 5 },
  { id: "passe_anterieur", fr: "passé antérieur", short: "passé antérieur", mode: "indicatif", aux: "passe_simple", level: 5 },
  { id: "futur_anterieur", fr: "futur antérieur", short: "futur antérieur", mode: "indicatif", aux: "futur", level: 4 },
  { id: "cond_present", fr: "conditionnel présent", short: "conditionnel", mode: "conditionnel", level: 4 },
  { id: "cond_passe", fr: "conditionnel passé", short: "conditionnel passé", mode: "conditionnel", aux: "cond_present", level: 7 },
  { id: "subj_present", fr: "subjonctif présent", short: "subjonctif", mode: "subjonctif", level: 7 },
  { id: "subj_passe", fr: "subjonctif passé", short: "subjonctif passé", mode: "subjonctif", aux: "subj_present", level: 7 },
  { id: "subj_imparfait", fr: "subjonctif imparfait", short: "subjonctif imparfait", mode: "subjonctif", level: 11 },
  { id: "subj_plus_que_parfait", fr: "subjonctif plus-que-parfait", short: "subjonctif plus-que-parfait", mode: "subjonctif", aux: "subj_imparfait", level: 11 },
  { id: "imp_present", fr: "impératif présent", short: "impératif", mode: "impératif", level: 7 },
  { id: "imp_passe", fr: "impératif passé", short: "impératif passé", mode: "impératif", aux: "imp_present", level: 11 },
];
export const tenseById = (id) => TENSES.find((t) => t.id === id) || null;
const SIMPLE = TENSES.filter((t) => !t.aux).map((t) => t.id);
/** Persons that exist in a tense (the imperative has tu, nous, vous). */
export const personsOf = (tense) => (tense.startsWith("imp_") ? [1, 3, 4] : [0, 1, 2, 3, 4, 5]);

// ---------- Endings ----------

const END = {
  a: ["ai", "as", "a", "âmes", "âtes", "èrent"],
  i: ["is", "is", "it", "îmes", "îtes", "irent"],
  u: ["us", "us", "ut", "ûmes", "ûtes", "urent"],
  in: ["ins", "ins", "int", "înmes", "întes", "inrent"],
  û: ["ûs", "ûs", "ût", "ûmes", "ûtes", "ûrent"],
  ï: ["ïs", "ïs", "ït", "ïmes", "ïtes", "ïrent"],
};
const IMPF = ["ais", "ais", "ait", "ions", "iez", "aient"];
const FUT = ["ai", "as", "a", "ons", "ez", "ont"];
const SUBJ = ["e", "es", "e", "ions", "iez", "ent"];

const uniq = (a) => [...new Set(a.filter((x) => x != null && x !== ""))];
const six = (fn) => Array.from({ length: 6 }, (_, i) => fn(i));

/** Subjunctive imperfect from the passé simple (2nd person singular): chantas → chantasse, chantât. */
function subjImpFrom(ps2) {
  if (!ps2) return six(() => null);
  const bases = ps2.map((f) => f.replace(/s$/, ""));
  // crûs → que je crusse, qu'il crût: only the 3rd person keeps (or gets) the circumflex.
  const flat = (b) => b.replace(/û$/, "u");
  const circ = (b) => (/[âîûï]$|[âîûï]n$/.test(b) ? b : b.replace(/([aiu])(n?)$/, (m, v, n) => ({ a: "â", i: "î", u: "û" })[v] + n));
  return [
    bases.map((b) => `${flat(b)}sse`),
    bases.map((b) => `${flat(b)}sses`),
    bases.map((b) => `${circ(b)}t`),
    bases.map((b) => `${flat(b)}ssions`),
    bases.map((b) => `${flat(b)}ssiez`),
    bases.map((b) => `${flat(b)}ssent`),
  ];
}

// ---------- First group ----------

const C = "(?:qu|gu|[bcçdfghjklmnpqrstvwxz])";
// -eler / -eter verbs that double the consonant (appelle, jette). The 1990 reform allows « è » for all of them
// except appeler, jeter and their compounds.
const DOUBLE = new Set("appeler rappeler interpeler jeter rejeter projeter interjeter déjeter surjeter épeler renouveler ruisseler chanceler étinceler ficeler niveler amonceler atteler dételer carreler ensorceler morceler museler grommeler bosseler craqueler denteler jumeler feuilleter étiqueter empaqueter cacheter décacheter épousseter breveter voleter souffleter déchiqueter becqueter caqueter colleter moucheter pailleter tacheter banqueter cliqueter".split(" "));
const STRICT_DOUBLE = new Set("appeler rappeler interpeler jeter rejeter projeter interjeter déjeter surjeter".split(" "));
// Accepted both ways (harceler: il harcèle / il harcelle).
const BOTH_E = new Set(["harceler"]);

function firstGroup(inf) {
  const st = inf.slice(0, -2);
  const cer = /c$/.test(st);
  const ger = /g$/.test(st);
  const soft = (end) => (/^[aoâ]/.test(end) ? (cer ? `${st.slice(0, -1)}ç` : ger ? `${st}e` : st) + end : st + end);
  let mute = [st]; // stem before a mute e (je lève, ils appellent)
  let fut = [inf]; // future stem
  let m;
  if (/[ou]y$/.test(st)) {
    mute = [`${st.slice(0, -1)}i`];
    fut = [`${st.slice(0, -1)}ier`];
  } else if (/ay$/.test(st)) {
    mute = [`${st.slice(0, -1)}i`, st];
    fut = [`${st.slice(0, -1)}ier`, `${st}er`];
  } else if ((m = st.match(new RegExp(`^(.*[^aeiouyéèêëîïôûœ])e(${C}r?)$`)))) {
    const [, a, c] = m;
    const grave = `${a}è${c}`;
    const dbl = `${a}e${c}${c.slice(-1)}`;
    if (DOUBLE.has(inf)) mute = STRICT_DOUBLE.has(inf) ? [dbl] : [dbl, grave];
    else if (BOTH_E.has(inf)) mute = [grave, dbl];
    else mute = [grave];
    fut = mute.map((x) => `${x}er`);
  } else if ((m = st.match(new RegExp(`^(.*)é(${C}+)$`)))) {
    const [, a, c] = m;
    mute = [`${a}è${c}`];
    fut = [inf, `${a}è${c}er`];
  }
  if (inf === "envoyer" || inf === "renvoyer") fut = [inf.replace(/oyer$/, "err")];
  const futStems = fut;
  const withEnd = (stems, end) => stems.map((s) => s + end);
  const F = {
    present: [withEnd(mute, "e"), withEnd(mute, "es"), withEnd(mute, "e"), [soft("ons")], [`${st}ez`], withEnd(mute, "ent")],
    imparfait: IMPF.map((e, i) => [i === 3 || i === 4 ? st + e : soft(e)]),
    passe_simple: END.a.map((e, i) => [i === 5 ? st + e : soft(e)]),
    futur: FUT.map((e) => withEnd(futStems, e)),
    cond_present: IMPF.map((e) => withEnd(futStems, e)),
    subj_present: SUBJ.map((e, i) => (i === 3 || i === 4 ? [st + e] : withEnd(mute, e))),
    imp_present: [null, withEnd(mute, "e"), null, [soft("ons")], [`${st}ez`], null],
    ppr: [soft("ant")],
    pp: [`${st}é`],
  };
  F.subj_imparfait = subjImpFrom(F.passe_simple[1]);
  return F;
}

// ---------- Second group ----------

function secondGroup(inf) {
  if (inf === "haïr") {
    return {
      present: [["hais"], ["hais"], ["hait"], ["haïssons"], ["haïssez"], ["haïssent"]],
      imparfait: IMPF.map((e) => [`haïss${e}`]),
      passe_simple: END.ï.map((e) => [`ha${e}`]),
      futur: FUT.map((e) => [`haïr${e}`]),
      cond_present: IMPF.map((e) => [`haïr${e}`]),
      subj_present: SUBJ.map((e) => [`haïss${e}`]),
      subj_imparfait: [["haïsse"], ["haïsses"], ["haït"], ["haïssions"], ["haïssiez"], ["haïssent"]],
      imp_present: [null, ["hais"], null, ["haïssons"], ["haïssez"], null],
      ppr: ["haïssant"],
      pp: ["haï"],
    };
  }
  const st = inf.slice(0, -2);
  const F = {
    present: ["is", "is", "it", "issons", "issez", "issent"].map((e) => [st + e]),
    imparfait: IMPF.map((e) => [`${st}iss${e}`]),
    passe_simple: END.i.map((e) => [st + e]),
    futur: FUT.map((e) => [inf + e]),
    cond_present: IMPF.map((e) => [inf + e]),
    subj_present: SUBJ.map((e) => [`${st}iss${e}`]),
    imp_present: [null, [`${st}is`], null, [`${st}issons`], [`${st}issez`], null],
    ppr: [`${st}issant`],
    pp: [`${st}i`],
  };
  F.subj_imparfait = subjImpFrom(F.passe_simple[1]);
  return F;
}

// ---------- Third group: models ----------
// A model: suffix of the infinitive, then templates where "~" is the root (infinitive minus the suffix).
//  p: present (6 forms, "-" = missing, "a|b" = variants) · ps: "stem type" of the passé simple (a, i, u, in, û) ·
//  f: future stem · pp: past participle · ppf: feminine when irregular · subj: 6 forms or "stem1:stem2" ·
//  impf: imperfect stem · imp: imperative (tu nous vous) · ppr: present participle ·
//  only: tenses that exist (defective verbs) · persons: persons that exist.
// Verbs: "infinitive[:flags]" — E: auxiliary être · B: être when intransitive, avoir with a direct object ·
//  P: always pronominal · I: participle never agrees in the pronominal form · H: aspirated h.

const MODELS = [
  { sfx: "être", p: "suis es est sommes êtes sont", impf: "ét", ps: "f u", f: "ser", pp: "été", subj: "sois sois soit soyons soyez soient", ppr: "étant", imp: "sois soyons soyez", verbs: "être" },
  { sfx: "avoir", p: "ai as a avons avez ont", ps: "e u", f: "aur", pp: "eu", subj: "aie aies ait ayons ayez aient", ppr: "ayant", imp: "aie ayons ayez", verbs: "avoir" },
  { sfx: "aller", p: "vais vas va allons allez vont", ps: "all a", f: "ir", pp: "allé", subj: "aill:all", verbs: "aller:E" },
  { sfx: "faire", p: "~fais ~fais ~fait ~faisons ~faites ~font", ps: "~f i", f: "~fer", pp: "~fait", subj: "~fass:~fass", verbs: "faire défaire refaire satisfaire contrefaire surfaire" },
  { sfx: "dire", p: "~dis ~dis ~dit ~disons ~dites ~disent", ps: "~d i", f: "~dir", pp: "~dit", verbs: "dire redire" },
  { sfx: "dire", p: "~dis ~dis ~dit ~disons ~disez ~disent", ps: "~d i", f: "~dir", pp: "~dit", verbs: "contredire dédire interdire médire prédire" },
  { sfx: "maudire", p: "maudis maudis maudit maudissons maudissez maudissent", ps: "maud i", f: "maudir", pp: "maudit", verbs: "maudire" },
  { sfx: "crire", p: "~cris ~cris ~crit ~crivons ~crivez ~crivent", ps: "~criv i", f: "~crir", pp: "~crit", verbs: "écrire décrire inscrire prescrire proscrire souscrire transcrire réécrire circonscrire" },
  { sfx: "lire", p: "~lis ~lis ~lit ~lisons ~lisez ~lisent", ps: "~l u", f: "~lir", pp: "~lu", verbs: "lire relire élire réélire" },
  { sfx: "ire", p: "~is ~is ~it ~isons ~isez ~isent", ps: "~ i", f: "~ir", pp: "~i", verbs: "suffire:I" },
  { sfx: "ire", p: "~is ~is ~it ~isons ~isez ~isent", ps: "~ i", f: "~ir", pp: "~it", verbs: "confire" },
  { sfx: "ire", p: "~is ~is ~it ~isons ~isez ~isent", ps: "~ i", f: "~ir", pp: "~is", verbs: "circoncire" },
  { sfx: "rire", p: "~ris ~ris ~rit ~rions ~riez ~rient", ps: "~r i", f: "~rir", pp: "~ri", verbs: "rire:I sourire:I" },
  { sfx: "uire", p: "~uis ~uis ~uit ~uisons ~uisez ~uisent", ps: "~uis i", f: "~uir", pp: "~uit", verbs: "conduire reconduire construire reconstruire détruire instruire produire reproduire réduire séduire traduire introduire déduire enduire cuire recuire" },
  { sfx: "uire", p: "~uis ~uis ~uit ~uisons ~uisez ~uisent", ps: "~uis i", f: "~uir", pp: "~ui", verbs: "nuire:I luire reluire" },
  { sfx: "aître", p: "~ais ~ais ~aît ~aissons ~aissez ~aissent", ps: "~ u", f: "~aîtr", pp: "~u", verbs: "connaître reconnaître méconnaître paraître apparaître:E disparaître comparaître réapparaître:E transparaître" },
  { sfx: "naître", p: "nais nais naît naissons naissez naissent", ps: "naqu i", f: "naîtr", pp: "né", verbs: "naître:E" },
  { sfx: "croître", p: "croîs croîs croît croissons croissez croissent", ps: "cr û", f: "croîtr", pp: "crû", verbs: "croître" },
  { sfx: "croître", p: "~crois ~crois ~croît ~croissons ~croissez ~croissent", ps: "~cr u", f: "~croîtr", pp: "~cru", verbs: "accroître décroître" },
  { sfx: "venir", p: "~viens ~viens ~vient ~venons ~venez ~viennent", ps: "~v in", f: "~viendr", pp: "~venu", verbs: "venir:E devenir:E revenir:E parvenir:E survenir:E intervenir:E provenir:E prévenir convenir:I contrevenir subvenir souvenir:EP" },
  { sfx: "tenir", p: "~tiens ~tiens ~tient ~tenons ~tenez ~tiennent", ps: "~t in", f: "~tiendr", pp: "~tenu", verbs: "tenir obtenir retenir maintenir soutenir contenir détenir appartenir entretenir abstenir:P" },
  { sfx: "mettre", p: "~mets ~mets ~met ~mettons ~mettez ~mettent", ps: "~m i", f: "~mettr", pp: "~mis", verbs: "mettre admettre commettre compromettre démettre émettre omettre permettre promettre remettre soumettre transmettre" },
  { sfx: "battre", p: "~bats ~bats ~bat ~battons ~battez ~battent", ps: "~batt i", f: "~battr", pp: "~battu", verbs: "battre abattre combattre débattre rabattre ébattre:P" },
  { sfx: "prendre", p: "~prends ~prends ~prend ~prenons ~prenez ~prennent", ps: "~pr i", f: "~prendr", pp: "~pris", verbs: "prendre apprendre comprendre surprendre reprendre entreprendre désapprendre méprendre:P" },
  { sfx: "dre", p: "~ds ~ds ~d ~dons ~dez ~dent", ps: "~d i", f: "~dr", pp: "~du", verbs: "rendre vendre revendre attendre entendre défendre descendre:B redescendre:B fendre pendre dépendre suspendre tendre étendre prétendre détendre répandre fondre confondre morfondre:P répondre:I correspondre pondre tondre perdre mordre tordre démordre" },
  { sfx: "pre", p: "~ps ~ps ~pt ~pons ~pez ~pent", ps: "~p i", f: "~pr", pp: "~pu", verbs: "rompre corrompre interrompre" },
  { sfx: "ndre", p: "~ns ~ns ~nt ~gnons ~gnez ~gnent", ps: "~gn i", f: "~ndr", pp: "~nt", verbs: "craindre plaindre contraindre peindre dépeindre repeindre teindre déteindre éteindre atteindre feindre ceindre astreindre restreindre enfreindre étreindre geindre joindre rejoindre adjoindre disjoindre enjoindre" },
  { sfx: "vaincre", p: "~vaincs ~vaincs ~vainc ~vainquons ~vainquez ~vainquent", ps: "~vainqu i", f: "~vaincr", pp: "~vaincu", verbs: "vaincre convaincre" },
  { sfx: "croire", p: "crois crois croit croyons croyez croient", ps: "cr u", f: "croir", pp: "cru", verbs: "croire" },
  { sfx: "boire", p: "bois bois boit buvons buvez boivent", ps: "b u", f: "boir", pp: "bu", verbs: "boire" },
  { sfx: "voir", p: "~vois ~vois ~voit ~voyons ~voyez ~voient", ps: "~v i", f: "~verr", pp: "~vu", verbs: "voir revoir entrevoir" },
  { sfx: "prévoir", p: "prévois prévois prévoit prévoyons prévoyez prévoient", ps: "prév i", f: "prévoir", pp: "prévu", verbs: "prévoir" },
  { sfx: "pourvoir", p: "pourvois pourvois pourvoit pourvoyons pourvoyez pourvoient", ps: "pourv u", f: "pourvoir", pp: "pourvu", verbs: "pourvoir" },
  { sfx: "savoir", p: "sais sais sait savons savez savent", ps: "s u", f: "saur", pp: "su", subj: "sach:sach", ppr: "sachant", imp: "sache sachons sachez", verbs: "savoir" },
  { sfx: "pouvoir", p: "peux|puis peux peut pouvons pouvez peuvent", ps: "p u", f: "pourr", pp: "pu", subj: "puiss:puiss", imp: "- - -", verbs: "pouvoir" },
  { sfx: "vouloir", p: "veux veux veut voulons voulez veulent", ps: "voul u", f: "voudr", pp: "voulu", subj: "veuill:voul", imp: "veuille|veux veuillons|voulons veuillez|voulez", verbs: "vouloir" },
  { sfx: "devoir", p: "dois dois doit devons devez doivent", ps: "d u", f: "devr", pp: "dû", verbs: "devoir" },
  { sfx: "cevoir", p: "~çois ~çois ~çoit ~cevons ~cevez ~çoivent", ps: "~ç u", f: "~cevr", pp: "~çu", verbs: "recevoir apercevoir concevoir décevoir percevoir" },
  { sfx: "valoir", p: "~vaux ~vaux ~vaut ~valons ~valez ~valent", ps: "~val u", f: "~vaudr", pp: "~valu", subj: "~vaill:~val", verbs: "valoir équivaloir revaloir" },
  { sfx: "prévaloir", p: "prévaux prévaux prévaut prévalons prévalez prévalent", ps: "préval u", f: "prévaudr", pp: "prévalu", verbs: "prévaloir" },
  { sfx: "falloir", p: "- - faut - - -", impf: "fall", ps: "fall u", f: "faudr", pp: "fallu", subj: "- - faille - - -", ppr: "-", imp: "- - -", persons: [2], verbs: "falloir" },
  { sfx: "pleuvoir", p: "- - pleut - - pleuvent", impf: "pleuv", ps: "pl u", f: "pleuvr", pp: "plu", subj: "- - pleuve - - pleuvent", ppr: "pleuvant", imp: "- - -", persons: [2, 5], verbs: "pleuvoir" },
  { sfx: "asseoir", p: "assieds|assois assieds|assois assied|assoit asseyons|assoyons asseyez|assoyez asseyent|assoient", ps: "ass i", f: "assiér|assoir", pp: "assis", verbs: "asseoir rasseoir" },
  { sfx: "mouvoir", p: "~meus ~meus ~meut ~mouvons ~mouvez ~meuvent", ps: "~m u", f: "~mouvr", pp: "~mû", verbs: "mouvoir" },
  { sfx: "mouvoir", p: "~meus ~meus ~meut ~mouvons ~mouvez ~meuvent", ps: "~m u", f: "~mouvr", pp: "~mu", verbs: "émouvoir promouvoir" },
  { sfx: "résoudre", p: "résous résous résout résolvons résolvez résolvent", ps: "résol u", f: "résoudr", pp: "résolu", verbs: "résoudre" },
  { sfx: "soudre", p: "~sous ~sous ~sout ~solvons ~solvez ~solvent", ps: "~sol u", f: "~soudr", pp: "~sous", ppf: "~soute", verbs: "absoudre dissoudre" },
  { sfx: "coudre", p: "~couds ~couds ~coud ~cousons ~cousez ~cousent", ps: "~cous i", f: "~coudr", pp: "~cousu", verbs: "coudre découdre recoudre" },
  { sfx: "moudre", p: "mouds mouds moud moulons moulez moulent", ps: "moul u", f: "moudr", pp: "moulu", verbs: "moudre" },
  { sfx: "clure", p: "~clus ~clus ~clut ~cluons ~cluez ~cluent", ps: "~cl u", f: "~clur", pp: "~clu", verbs: "conclure exclure" },
  { sfx: "clure", p: "~clus ~clus ~clut ~cluons ~cluez ~cluent", ps: "~cl u", f: "~clur", pp: "~clus", verbs: "inclure occlure" },
  { sfx: "clore", p: "~clos ~clos ~clôt - - ~closent", ps: "-", f: "~clor", pp: "~clos", subj: "~close ~closes ~close - - ~closent", imp: "~clos - -", only: ["present", "futur", "cond_present", "subj_present", "imp_present"], verbs: "clore" },
  { sfx: "éclore", p: "éclos éclos éclot - - éclosent", ps: "-", f: "éclor", pp: "éclos", subj: "éclose écloses éclose - - éclosent", imp: "- - -", only: ["present", "futur", "cond_present", "subj_present"], verbs: "éclore:E" },
  { sfx: "fuir", p: "~fuis ~fuis ~fuit ~fuyons ~fuyez ~fuient", ps: "~fu i", f: "~fuir", pp: "~fui", verbs: "fuir enfuir:EP" },
  { sfx: "courir", p: "~cours ~cours ~court ~courons ~courez ~courent", ps: "~cour u", f: "~courr", pp: "~couru", verbs: "courir accourir concourir discourir encourir parcourir recourir secourir" },
  { sfx: "mourir", p: "meurs meurs meurt mourons mourez meurent", ps: "mour u", f: "mourr", pp: "mort", verbs: "mourir:E" },
  { sfx: "quérir", p: "~quiers ~quiers ~quiert ~quérons ~quérez ~quièrent", ps: "~qu i", f: "~querr", pp: "~quis", verbs: "acquérir conquérir requérir reconquérir enquérir:P" },
  { sfx: "vivre", p: "~vis ~vis ~vit ~vivons ~vivez ~vivent", ps: "~véc u", f: "~vivr", pp: "~vécu", verbs: "vivre revivre survivre:I" },
  { sfx: "suivre", p: "~suis ~suis ~suit ~suivons ~suivez ~suivent", ps: "~suiv i", f: "~suivr", pp: "~suivi", verbs: "suivre poursuivre" },
  { sfx: "rir", p: "~re ~res ~re ~rons ~rez ~rent", ps: "~r i", f: "~rir", pp: "~ert", verbs: "ouvrir rouvrir entrouvrir couvrir découvrir recouvrir offrir souffrir" },
  { sfx: "cueillir", p: "~cueille ~cueilles ~cueille ~cueillons ~cueillez ~cueillent", ps: "~cueill i", f: "~cueiller", pp: "~cueilli", verbs: "cueillir accueillir recueillir" },
  { sfx: "aillir", p: "~aille ~ailles ~aille ~aillons ~aillez ~aillent", ps: "~aill i", f: "~aillir", pp: "~ailli", verbs: "assaillir tressaillir défaillir" },
  { sfx: "bouillir", p: "bous bous bout bouillons bouillez bouillent", ps: "bouill i", f: "bouillir", pp: "bouilli", verbs: "bouillir" },
  { sfx: "vêtir", p: "~vêts ~vêts ~vêt ~vêtons ~vêtez ~vêtent", ps: "~vêt i", f: "~vêtir", pp: "~vêtu", verbs: "vêtir revêtir dévêtir" },
  { sfx: "tir", p: "~s ~s ~t ~tons ~tez ~tent", ps: "~t i", f: "~tir", pp: "~ti", verbs: "partir:E repartir:E sortir:B ressortir:B sentir consentir pressentir ressentir mentir:I démentir repentir:P" },
  { sfx: "mir", p: "~s ~s ~t ~mons ~mez ~ment", ps: "~m i", f: "~mir", pp: "~mi", verbs: "dormir endormir rendormir" },
  { sfx: "vir", p: "~s ~s ~t ~vons ~vez ~vent", ps: "~v i", f: "~vir", pp: "~vi", verbs: "servir desservir resservir" },
  { sfx: "traire", p: "~trais ~trais ~trait ~trayons ~trayez ~traient", ps: "-", f: "~trair", pp: "~trait", only: ["present", "imparfait", "futur", "cond_present", "subj_present", "imp_present"], verbs: "traire extraire distraire soustraire abstraire" },
  { sfx: "frire", p: "fris fris frit - - -", ps: "-", f: "frir", pp: "frit", subj: "- - - - - -", imp: "fris - -", only: ["present", "futur", "cond_present", "imp_present"], verbs: "frire" },
  { sfx: "plaire", p: "~plais ~plais ~plaît ~plaisons ~plaisez ~plaisent", ps: "~pl u", f: "~plair", pp: "~plu", verbs: "plaire:I déplaire:I complaire:I" },
  { sfx: "taire", p: "tais tais tait taisons taisez taisent", ps: "t u", f: "tair", pp: "tu", verbs: "taire" },
  { sfx: "gésir", p: "gis gis gît gisons gisez gisent", impf: "gis", ps: "-", f: "-", pp: "-", ppr: "gisant", only: ["present", "imparfait"], verbs: "gésir" },
  { sfx: "choir", p: "chois chois choit - - choient", ps: "ch u", f: "choir|cherr", pp: "chu", only: ["present", "passe_simple", "futur", "cond_present"], verbs: "choir:E" },
  { sfx: "échoir", p: "- - échoit - - échoient", ps: "éch u", f: "échoir|écherr", pp: "échu", subj: "- - échoie - - échoient", ppr: "échéant", persons: [2, 5], only: ["present", "passe_simple", "futur", "cond_present", "subj_present"], verbs: "échoir:E" },
  { sfx: "seoir", p: "- - sied - - siéent", impf: "sey", ps: "-", f: "siér", pp: "-", subj: "- - siée - - siéent", ppr: "seyant", persons: [2, 5], only: ["present", "imparfait", "futur", "cond_present", "subj_present"], verbs: "seoir" },
  { sfx: "paître", p: "pais pais paît paissons paissez paissent", ps: "-", f: "paîtr", pp: "-", only: ["present", "imparfait", "futur", "cond_present", "subj_present", "imp_present"], verbs: "paître" },
  { sfx: "braire", p: "- - brait - - braient", ps: "-", f: "brair", pp: "brait", subj: "- - - - - -", persons: [2, 5], only: ["present", "futur", "cond_present"], verbs: "braire" },
  { sfx: "faillir", p: "faillis faillis faillit faillissons faillissez faillissent", ps: "faill i", f: "faillir", pp: "failli", verbs: "faillir" },
];

// ---------- Verb list ----------

// First group, by frequency band ("1" everyday … "3" rare). Flags as above.
const FIRST = {
  1: "aimer chanter danser parler:I téléphoner:I manger jouer travailler regarder écouter habiter marcher donner trouver penser demander:I laisser porter montrer arriver:E entrer:E rentrer:B rester:E tomber:E passer:B monter:B retourner:B commencer lancer placer avancer nager ranger changer voyager partager bouger mélanger juger corriger mener amener emmener promener lever enlever acheter appeler rappeler jeter préférer espérer répéter compléter payer essayer envoyer nettoyer appuyer essuyer créer crier oublier étudier copier remercier continuer saluer cacher chercher toucher coucher attacher sauter tourner quitter garder accepter aider ajouter allumer apporter arrêter augmenter baisser briller brûler casser chauffer coller compter couper décider déjeuner dépenser dessiner deviner dîner discuter durer embrasser emprunter éviter exister expliquer fermer fêter frapper gagner goûter grimper habiller hésiter imaginer inviter laver manquer marquer mériter mesurer nommer noter organiser oser pardonner participer pleurer poser pousser préparer présenter prêter profiter prouver raconter ramasser rater refuser regretter remarquer rencontrer réparer reposer respecter respirer ressembler:I retirer réveiller rêver rouler sauver sembler signer sonner souhaiter supporter terminer tirer traverser tromper utiliser visiter voler voter hurler:H dépêcher:P moquer:P",
  2: "annoncer prononcer effacer remplacer menacer renoncer tracer forcer bercer percer exercer plonger diriger exiger protéger obliger encourager interroger songer charger venger ménager allonger déménager envisager négliger rédiger héberger loger arranger déranger échanger engager dégager soulever élever achever peser semer geler peler modeler racheter épeler renouveler étinceler ficeler feuilleter étiqueter harceler céder espérer posséder régler célébrer sécher inquiéter accélérer considérer exagérer opérer pénétrer récupérer refléter révéler suggérer tolérer interpréter intégrer libérer modérer procéder succéder:I précéder digérer gérer lécher abréger alléger assiéger balayer effrayer employer renvoyer tutoyer vouvoyer noyer aboyer ennuyer agréer apprécier vérifier confier marier multiplier nier photographier simplifier sacrifier tuer diminuer distribuer évaluer louer nouer avouer échouer secouer accrocher approcher rapprocher reprocher décrocher boucher brancher bavarder blesser causer chasser conserver consulter coûter déclarer décorer découper déposer désirer douter éclairer enseigner entourer épouser exprimer fumer garer gaspiller glisser gronder informer inventer mépriser observer patienter plaisanter polluer recommander rembourser renseigner réserver saigner supposer tousser tricher hacher:H hanter:H heurter:H hisser:H hâter:H hausser:H méfier:P efforcer:P emparer:P écrier:P exclamer:P évader:P",
  3: "dépecer rapiécer sevrer déléguer léguer alléguer disséquer sécréter réitérer ruisseler chanceler niveler amonceler atteler dételer ensorceler morceler museler grommeler cacheter épousseter breveter déchiqueter becqueter marteler démanteler écarteler ciseler congeler dégeler surgeler celer déceler receler crocheter corseter fureter haleter:H hasarder:H huer:H hérisser:H rudoyer festoyer chatoyer louvoyer octroyer apitoyer déployer guerroyer côtoyer broyer ployer bégayer égayer étayer monnayer pagayer rayer relayer grasseyer insurger:P obstiner:P lamenter:P désister:P démener:P évertuer:P agenouiller:P accouder:P",
};
const SECOND = {
  1: "finir choisir réussir grandir grossir maigrir rougir vieillir réfléchir obéir punir remplir salir applaudir atterrir bâtir agir avertir saisir guérir nourrir ralentir réagir réunir fleurir unir haïr:H",
  2: "désobéir pâlir rajeunir garantir investir établir accomplir approfondir élargir envahir franchir frémir gémir jaillir munir mûrir noircir blanchir jaunir rôtir rétrécir ravir trahir enrichir appauvrir affaiblir éblouir évanouir:P épanouir bondir durcir adoucir raccourcir alourdir aboutir abolir anéantir assouplir divertir convertir démolir embellir enfouir engloutir éclaircir épaissir fournir gravir subir surgir vomir bénir",
  3: "assainir infléchir intervertir meurtrir mugir ourdir périr polir pourrir raidir rebondir rugir ternir vernir hennir:H",
};
// Third group frequency bands (the others are band 2).
const THIRD_BAND1 = new Set("être avoir aller faire dire écrire lire rire conduire construire détruire produire traduire connaître reconnaître paraître disparaître naître venir devenir revenir tenir obtenir mettre permettre promettre battre prendre apprendre comprendre surprendre rendre vendre attendre entendre descendre répondre perdre éteindre peindre craindre plaindre joindre croire boire voir savoir pouvoir vouloir devoir recevoir apercevoir valoir falloir pleuvoir asseoir courir mourir vivre suivre ouvrir couvrir découvrir offrir souffrir cueillir accueillir partir sortir sentir mentir dormir servir plaire taire souvenir".split(" "));
const THIRD_BAND3 = new Set("maudire circoncire confire reluire luire méconnaître comparaître transparaître croître accroître décroître contrevenir subvenir surfaire contredire dédire médire prédire réélire proscrire circonscrire recuire enduire ébattre rabattre morfondre démordre ceindre astreindre enfreindre geindre adjoindre disjoindre enjoindre entrevoir pourvoir revaloir prévaloir équivaloir rasseoir mouvoir absoudre dissoudre découdre recoudre moudre occlure clore éclore encourir discourir concourir requérir reconquérir enquérir rouvrir entrouvrir défaillir tressaillir assaillir bouillir vêtir revêtir dévêtir pressentir démentir repentir rendormir desservir resservir traire extraire distraire soustraire abstraire frire complaire gésir choir échoir seoir paître braire faillir".split(" "));

// ---------- Index ----------

const ENTRIES = new Map(); // infinitive → { inf, group, aux, pron, ha, inv, band, model, root }

function flagsOf(s) {
  const [inf, f = ""] = s.split(":");
  return { inf, aux: f.includes("E") ? "être" : "avoir", both: f.includes("B"), pron: f.includes("P"), inv: f.includes("I"), ha: f.includes("H") };
}
for (const [band, list] of Object.entries(FIRST)) for (const s of list.split(/\s+/)) {
  const e = flagsOf(s);
  if (e.both) e.aux = "être";
  if (!ENTRIES.has(e.inf)) ENTRIES.set(e.inf, { ...e, group: 1, band: Number(band) });
}
for (const [band, list] of Object.entries(SECOND)) for (const s of list.split(/\s+/)) {
  const e = flagsOf(s);
  if (!ENTRIES.has(e.inf)) ENTRIES.set(e.inf, { ...e, group: 2, band: Number(band) });
}
MODELS.forEach((m, mi) => {
  for (const s of m.verbs.split(/\s+/)) {
    const e = flagsOf(s);
    if (e.both) e.aux = "être";
    const root = e.inf.slice(0, e.inf.length - m.sfx.length);
    if (!e.inf.endsWith(m.sfx)) throw new Error(`modèle ${m.sfx} : ${e.inf}`);
    const band = THIRD_BAND1.has(e.inf) ? 1 : THIRD_BAND3.has(e.inf) ? 3 : 2;
    ENTRIES.set(e.inf, { ...e, group: 3, band, model: mi, root });
  }
});
// Pronominal verbs (s'asseoir, se taire…) used in exercises are listed with their pronominal use only.
const USUALLY_PRON = new Set("asseoir taire souvenir enfuir abstenir repentir méfier efforcer emparer écrier exclamer évader évanouir dépêcher moquer insurger obstiner lamenter désister démener évertuer agenouiller accouder méprendre ébattre morfondre enquérir".split(" "));

/** All verbs: { inf, group, aux, both, pron, inv, ha, band }. */
export const VERBS = [...ENTRIES.values()];
/** A verb of the list, or a regular verb of the 1st group when the infinitive ends in -er (aller excepted). */
export function verbInfo(inf) {
  const v = stripPron(inf);
  const e = ENTRIES.get(v);
  if (e) return e;
  if (/^[a-zàâäçéèêëîïôöùûüœ]+er$/.test(v) && v !== "aller") {
    const x = { inf: v, aux: "avoir", both: false, pron: false, inv: false, ha: false, group: 1, band: 3, guessed: true };
    ENTRIES.set(v, x);
    return x;
  }
  return null;
}
/** "se lever" / "s'asseoir" → "lever" / "asseoir". */
export function stripPron(inf) {
  return String(inf).trim().replace(/^(se\s+|s')/, "");
}
export const isPronominalInf = (inf) => /^(se\s|s')/.test(String(inf).trim());

// ---------- Simple forms ----------

const cache = new Map();

function fromModel(e) {
  const m = MODELS[e.model];
  const T = (s) => (s == null ? null : s.replace(/~/g, e.root));
  const forms6 = (s) =>
    T(s)
      .split(/\s+/)
      .map((x) => (x === "-" ? null : x.split("|")));
  const present = forms6(m.p);
  const nous = present[3];
  const impfStems = m.impf ? T(m.impf).split("|") : nous ? nous.map((f) => f.replace(/ons$/, "")) : null;
  const imparfait = impfStems ? IMPF.map((x) => impfStems.map((s) => s + x)) : six(() => null);
  let passe_simple = six(() => null);
  if (m.ps && m.ps !== "-") {
    const [stem, type] = T(m.ps).split(" ");
    passe_simple = END[type].map((x) => [stem + x]);
  }
  const futStems = m.f && m.f !== "-" ? T(m.f).split("|") : null;
  const futur = futStems ? FUT.map((x) => futStems.map((s) => s + x)) : six(() => null);
  const cond_present = futStems ? IMPF.map((x) => futStems.map((s) => s + x)) : six(() => null);
  let subj_present;
  if (m.subj && m.subj.includes(" ")) subj_present = forms6(m.subj);
  else {
    let s1;
    let s2;
    if (m.subj) [s1, s2] = T(m.subj).split(":").map((x) => x.split("|"));
    else {
      s1 = present[5] ? present[5].map((f) => f.replace(/ent$/, "")) : null;
      s2 = nous ? nous.map((f) => f.replace(/ons$/, "")) : null;
    }
    subj_present = SUBJ.map((x, i) => {
      const st = i === 3 || i === 4 ? s2 : s1;
      return st ? st.map((s) => s + x) : null;
    });
  }
  let imp_present;
  if (m.imp) {
    const [t, n, v] = T(m.imp)
      .split(/\s+/)
      .map((x) => (x === "-" ? null : x.split("|")));
    imp_present = [null, t, null, n, v, null];
  } else {
    const tu = present[1] ? present[1].map((f) => (f === "vas" ? "va" : f.replace(/es$/, "e"))) : null;
    imp_present = [null, tu, null, present[3], present[4], null];
  }
  const ppr = m.ppr === "-" ? null : m.ppr ? T(m.ppr).split("|") : nous ? nous.map((f) => f.replace(/ons$/, "ant")) : null;
  const pp = m.pp && m.pp !== "-" ? T(m.pp).split("|") : null;
  const F = { present, imparfait, passe_simple, futur, cond_present, subj_present, imp_present, ppr, pp, ppf: m.ppf ? T(m.ppf) : null };
  F.subj_imparfait = subjImpFrom(passe_simple[1]);
  if (m.only) for (const t of SIMPLE) if (!m.only.includes(t)) F[t] = six(() => null);
  if (m.persons) for (const t of SIMPLE) F[t] = F[t].map((x, i) => (m.persons.includes(i) ? x : null));
  F.persons = m.persons || null;
  F.only = m.only || null;
  return F;
}

/** Simple forms of a verb: { present, imparfait, …, ppr, pp } (each person = array of variants or null). */
export function simpleForms(inf) {
  const e = verbInfo(inf);
  if (!e) return null;
  if (cache.has(e.inf)) return cache.get(e.inf);
  const F = e.group === 1 ? firstGroup(e.inf) : e.group === 2 ? secondGroup(e.inf) : fromModel(e);
  cache.set(e.inf, F);
  return F;
}

/** Past participle agreed: g "m" | "f", plural boolean. Returns variants. */
export function participle(inf, g = "m", plural = false) {
  const F = simpleForms(inf);
  if (!F?.pp) return [];
  return uniq(
    F.pp.map((ms) => {
      if (inf === "être" || stripPron(inf) === "être") return ms; // été never agrees
      const base = /û$/.test(ms) ? ms.replace(/û$/, "u") : ms; // dû → due, dus; mû → mue; crû → crue
      const fs = F.ppf || `${base}e`;
      if (g === "f") return plural ? `${fs}s` : fs;
      if (!plural) return ms;
      return /[sx]$/.test(base) ? base : `${base}s`;
    }),
  );
}

// ---------- Phrases ----------

const VOWEL = /^[aeiouyàâäéèêëîïôöùûüœæh]/i;
/** True when a word elides the word before it (j', n', m', qu'…). */
export function elides(word, inf = "") {
  const w = String(word || "").toLowerCase();
  if (!VOWEL.test(w)) return false;
  if (w[0] !== "h") return true;
  // A form of the verb: aspirated h (je hais, je hurle) unless it is an auxiliary.
  const e = verbInfo(inf);
  return !(e?.ha && w.startsWith(e.inf.slice(0, 2)));
}
const ELIDABLE = new Set(["je", "me", "te", "se", "ne", "que", "le", "la", "de"]);
/** Joins words, eliding je / me / te / se / ne / que before a vowel or a mute h. */
export function joinWords(words, inf = "") {
  const out = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const n = words[i + 1];
    if (ELIDABLE.has(w) && n && elides(n, inf)) {
      words[i + 1] = `${w.slice(0, -1)}'${n}`;
      continue;
    }
    out.push(w);
  }
  return out.join(" ").replace(/' /g, "'");
}

/** Auxiliary of a verb in a given use (pronominal verbs always take être). */
export function auxOf(inf, { pron = false, transitive = false } = {}) {
  const e = verbInfo(inf);
  if (!e) return "avoir";
  if (pron || e.pron || isPronominalInf(inf)) return "être";
  if (e.both && transitive) return "avoir";
  return e.aux;
}

/** Does the participle agree with the subject in this use? */
function agrees(inf, aux, pron) {
  const e = verbInfo(inf);
  if (aux !== "être") return false;
  if (pron && e?.inv) return false;
  return true;
}

const cartesian = (lists) => lists.reduce((acc, l) => acc.flatMap((a) => l.map((b) => [...a, b])), [[]]);

/**
 * All accepted phrases for a verb in a tense and person (index 0-5), without the subject unless `subject` is set.
 * opts: { g: "m"|"f"|null (null = both accepted), neg, question, pron, who: "il"|"elle"|"on"|"ils"|"elles",
 *         transitive (B verbs with a direct object take avoir) }
 * Question = inversion (Mange-t-il ? T'es-tu levé ?). Returns [] when the form does not exist.
 */
export function conjugations(infIn, tense, p, opts = {}) {
  const pron = !!(opts.pron || isPronominalInf(infIn) || verbInfo(infIn)?.pron);
  const inf = stripPron(infIn);
  const e = verbInfo(inf);
  const t = tenseById(tense);
  if (!e || !t) return [];
  if (!personsOf(tense).includes(p)) return [];
  const F = simpleForms(inf);
  if (F.persons && !F.persons.includes(p)) return [];
  const imperative = tense.startsWith("imp_");
  if (opts.question && (imperative || p === 0)) return [];
  const plural = p >= 3;
  const who = opts.who || PERSONS[p];
  const genders = opts.g ? [opts.g] : p === 2 || p === 5 ? [/^elle/.test(who) ? "f" : "m"] : ["m", "f"];
  const plurals = p === 4 && !opts.g ? [true, false] : [plural];
  const out = [];
  for (const g of genders) {
    for (const pl of plurals) {
      let verbParts; // [[variants of word 1], [word 2]…]
      if (!t.aux) {
        const f = F[tense]?.[p];
        if (!f) return [];
        verbParts = [f];
      } else {
        const aux = auxOf(inf, { pron, transitive: opts.transitive });
        const af = simpleForms(aux)[t.aux]?.[p];
        const pp = agrees(inf, aux, pron) ? participle(inf, g, pl) : participle(inf, "m", false);
        if (!af || !pp.length) return [];
        verbParts = [af, pp];
      }
      for (const combo of cartesian(verbParts)) out.push(arrange(inf, combo, p, who, { ...opts, pron, imperative }));
    }
  }
  return uniq(out);
}

/** Puts the verb words, reflexive pronoun, negation and inverted subject in order. */
function arrange(inf, [v, pp], p, who, { neg, question, pron, imperative, subject }) {
  const refl = pron ? REFL[p] : null;
  if (imperative) {
    if (!neg) {
      const head = pron ? `${v}-${STRESSED[p]}` : v;
      return pp ? `${head} ${pp}` : head;
    }
    return joinWords(["ne", ...(refl ? [refl] : []), v, "pas", ...(pp ? [pp] : [])], inf);
  }
  if (question) {
    const third = /^(il|elle|on)$/.test(who);
    const link = third && /[ea]$/.test(v) ? "-t-" : "-";
    const head = `${v}${link}${who}`;
    const words = [...(neg ? ["ne"] : []), ...(refl ? [refl] : []), head, ...(neg ? ["pas"] : []), ...(pp ? [pp] : [])];
    return joinWords(words, inf);
  }
  const words = [...(subject ? [subject] : []), ...(neg ? ["ne"] : []), ...(refl ? [refl] : []), v, ...(neg ? ["pas"] : []), ...(pp ? [pp] : [])];
  return joinWords(words, inf);
}

const genderOf = (opts) => opts.g || (/^elle/.test(opts.who || "") ? "f" : "m");

/** The reference phrase (first accepted form), or "" when the form does not exist. */
export function conjugate(inf, tense, p, opts = {}) {
  return conjugations(inf, tense, p, { ...opts, g: genderOf(opts) })[0] || "";
}

/** Subject pronoun + phrase, with elision and "que" in the subjunctive (for the conjugation tables). */
export function withSubject(inf, tense, p, opts = {}) {
  const forms = conjugations(inf, tense, p, { ...opts, g: genderOf(opts) });
  if (!forms.length) return "";
  const t = tenseById(tense);
  if (t.mode === "impératif") return forms[0];
  const subj = opts.who || PERSONS[p];
  const words = [...(t.mode === "subjonctif" ? ["que"] : []), subj, forms[0]];
  // Elide "je" and "que" against the next word.
  let s = words.join(" ");
  s = s.replace(/\bque (il|elle|on|ils|elles)\b/g, "qu'$1");
  s = s.replace(/\bje ([aeiouyàâäéèêëîïôöùûüœæ])/gi, "j'$1");
  const e = verbInfo(stripPron(inf));
  if (!e?.ha) s = s.replace(/\bje (h)/gi, "j'$1");
  return s;
}

/** Infinitive, participles and gerund. */
export function nominalForms(inf) {
  const F = simpleForms(inf);
  if (!F) return null;
  const aux = auxOf(inf);
  return {
    infinitif: stripPron(inf),
    infinitifPasse: F.pp ? `${aux} ${participle(inf)[0]}` : "",
    participePresent: F.ppr?.[0] || "",
    participePasse: F.pp ? [participle(inf, "m", false)[0], participle(inf, "f", false)[0], participle(inf, "m", true)[0], participle(inf, "f", true)[0]] : [],
    gerondif: F.ppr ? `en ${F.ppr[0]}` : "",
  };
}

/** Group label for display. */
export const groupLabel = (inf) => ({ 1: "1er groupe", 2: "2e groupe", 3: "3e groupe" })[verbInfo(inf)?.group] || "";
export { USUALLY_PRON };

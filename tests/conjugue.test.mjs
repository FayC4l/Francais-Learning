import { test } from "node:test";
import assert from "node:assert/strict";
import { conjugate, conjugations, participle, withSubject, nominalForms, VERBS, verbInfo, simpleForms, TENSES, auxOf } from "../src/engine/conjugue.js";

// Reference forms (Bescherelle). [infinitive, tense, person 0-5, expected, options?]
const P = [0, 1, 2, 3, 4, 5];
const table = (inf, tense, forms) => forms.split(" ").forEach((f, i) => f !== "-" && assert.equal(conjugate(inf, tense, P[i]), f.replace(/_/g, " "), `${inf} ${tense} ${i}`));

test("présent : tous les groupes et les irréguliers", () => {
  table("chanter", "present", "chante chantes chante chantons chantez chantent");
  table("finir", "present", "finis finis finit finissons finissez finissent");
  table("aller", "present", "vais vas va allons allez vont");
  table("être", "present", "suis es est sommes êtes sont");
  table("avoir", "present", "ai as a avons avez ont");
  table("faire", "present", "fais fais fait faisons faites font");
  table("dire", "present", "dis dis dit disons dites disent");
  table("prédire", "present", "prédis prédis prédit prédisons prédisez prédisent");
  table("prendre", "present", "prends prends prend prenons prenez prennent");
  table("venir", "present", "viens viens vient venons venez viennent");
  table("résoudre", "present", "résous résous résout résolvons résolvez résolvent");
  table("acquérir", "present", "acquiers acquiers acquiert acquérons acquérez acquièrent");
  table("vaincre", "present", "vaincs vaincs vainc vainquons vainquez vainquent");
  table("rompre", "present", "romps romps rompt rompons rompez rompent");
  table("coudre", "present", "couds couds coud cousons cousez cousent");
  table("moudre", "present", "mouds mouds moud moulons moulez moulent");
  table("peindre", "present", "peins peins peint peignons peignez peignent");
  table("haïr", "present", "hais hais hait haïssons haïssez haïssent");
  table("appeler", "present", "appelle appelles appelle appelons appelez appellent");
  table("acheter", "present", "achète achètes achète achetons achetez achètent");
  table("jeter", "present", "jette jettes jette jetons jetez jettent");
  table("céder", "present", "cède cèdes cède cédons cédez cèdent");
  table("nettoyer", "present", "nettoie nettoies nettoie nettoyons nettoyez nettoient");
  table("bouillir", "present", "bous bous bout bouillons bouillez bouillent");
  table("conclure", "present", "conclus conclus conclut concluons concluez concluent");
  table("croire", "present", "crois crois croit croyons croyez croient");
  table("mourir", "present", "meurs meurs meurt mourons mourez meurent");
  table("recevoir", "present", "reçois reçois reçoit recevons recevez reçoivent");
  table("valoir", "present", "vaux vaux vaut valons valez valent");
  table("mouvoir", "present", "meus meus meut mouvons mouvez meuvent");
  table("plaire", "present", "plais plais plaît plaisons plaisez plaisent");
  table("naître", "present", "nais nais naît naissons naissez naissent");
  table("ouvrir", "present", "ouvre ouvres ouvre ouvrons ouvrez ouvrent");
  table("cueillir", "present", "cueille cueilles cueille cueillons cueillez cueillent");
  table("commencer", "present", "commence commences commence commençons commencez commencent");
  table("manger", "present", "mange manges mange mangeons mangez mangent");
  table("protéger", "present", "protège protèges protège protégeons protégez protègent");
  table("dormir", "present", "dors dors dort dormons dormez dorment");
  table("servir", "present", "sers sers sert servons servez servent");
  table("connaître", "present", "connais connais connaît connaissons connaissez connaissent");
  table("vivre", "present", "vis vis vit vivons vivez vivent");
  table("suivre", "present", "suis suis suit suivons suivez suivent");
  table("fuir", "present", "fuis fuis fuit fuyons fuyez fuient");
  table("rire", "present", "ris ris rit rions riez rient");
  table("conduire", "present", "conduis conduis conduit conduisons conduisez conduisent");
  table("écrire", "present", "écris écris écrit écrivons écrivez écrivent");
  table("devoir", "present", "dois dois doit devons devez doivent");
  table("savoir", "present", "sais sais sait savons savez savent");
  table("vouloir", "present", "veux veux veut voulons voulez veulent");
  table("battre", "present", "bats bats bat battons battez battent");
  table("mettre", "present", "mets mets met mettons mettez mettent");
  table("courir", "present", "cours cours court courons courez courent");
  table("boire", "present", "bois bois boit buvons buvez boivent");
  table("traire", "present", "trais trais trait trayons trayez traient");
  assert.equal(conjugate("falloir", "present", 2), "faut");
  assert.equal(conjugate("pleuvoir", "present", 2), "pleut");
  assert.ok(conjugations("pouvoir", "present", 0).includes("puis"));
  assert.ok(conjugations("payer", "present", 0).includes("paye") && conjugations("payer", "present", 0).includes("paie"));
  assert.ok(conjugations("asseoir", "present", 0).includes("assois") && conjugations("asseoir", "present", 0).includes("assieds"));
  assert.ok(conjugations("renouveler", "present", 0).includes("renouvèle"), "rectification de 1990");
  assert.ok(!conjugations("appeler", "present", 0).includes("appèle"), "appeler garde le doublement");
});

test("imparfait", () => {
  assert.equal(conjugate("étudier", "imparfait", 3), "étudiions");
  assert.equal(conjugate("rire", "imparfait", 3), "riions");
  assert.equal(conjugate("payer", "imparfait", 3), "payions");
  assert.equal(conjugate("commencer", "imparfait", 0), "commençais");
  assert.equal(conjugate("commencer", "imparfait", 3), "commencions");
  assert.equal(conjugate("manger", "imparfait", 2), "mangeait");
  assert.equal(conjugate("manger", "imparfait", 4), "mangiez");
  assert.equal(conjugate("être", "imparfait", 0), "étais");
  assert.equal(conjugate("faire", "imparfait", 0), "faisais");
  assert.equal(conjugate("falloir", "imparfait", 2), "fallait");
  assert.equal(conjugate("croire", "imparfait", 3), "croyions");
  assert.equal(conjugate("voir", "imparfait", 4), "voyiez");
  assert.equal(conjugate("finir", "imparfait", 5), "finissaient");
});

test("passé simple", () => {
  table("aller", "passe_simple", "allai allas alla allâmes allâtes allèrent");
  table("être", "passe_simple", "fus fus fut fûmes fûtes furent");
  table("avoir", "passe_simple", "eus eus eut eûmes eûtes eurent");
  table("venir", "passe_simple", "vins vins vint vînmes vîntes vinrent");
  table("manger", "passe_simple", "mangeai mangeas mangea mangeâmes mangeâtes mangèrent");
  table("commencer", "passe_simple", "commençai commenças commença commençâmes commençâtes commencèrent");
  table("haïr", "passe_simple", "haïs haïs haït haïmes haïtes haïrent");
  table("croître", "passe_simple", "crûs crûs crût crûmes crûtes crûrent");
  const third = { faire: "fit", prendre: "prit", tenir: "tint", voir: "vit", devoir: "dut", pouvoir: "put", savoir: "sut", vouloir: "voulut", mourir: "mourut", naître: "naquit", vaincre: "vainquit", vivre: "vécut", croire: "crut", boire: "but", lire: "lut", plaire: "plut", pleuvoir: "plut", mettre: "mit", résoudre: "résolut", coudre: "cousit", moudre: "moulut", conduire: "conduisit", écrire: "écrivit", peindre: "peignit", craindre: "craignit", acquérir: "acquit", ouvrir: "ouvrit", cueillir: "cueillit", asseoir: "assit", connaître: "connut", recevoir: "reçut", valoir: "valut", falloir: "fallut", courir: "courut", rompre: "rompit", finir: "finit", dire: "dit", rire: "rit", suivre: "suivit", fuir: "fuit", battre: "battit", servir: "servit", partir: "partit", mouvoir: "mut", conclure: "conclut", taire: "tut", paraître: "parut" };
  for (const [v, f] of Object.entries(third)) assert.equal(conjugate(v, "passe_simple", 2), f, v);
  assert.equal(conjugate("traire", "passe_simple", 2), "", "traire n'a pas de passé simple");
});

test("futur et conditionnel", () => {
  const fut = { aller: "irai", être: "serai", avoir: "aurai", faire: "ferai", dire: "dirai", prendre: "prendrai", venir: "viendrai", tenir: "tiendrai", voir: "verrai", prévoir: "prévoirai", envoyer: "enverrai", renvoyer: "renverrai", pouvoir: "pourrai", vouloir: "voudrai", savoir: "saurai", devoir: "devrai", recevoir: "recevrai", valoir: "vaudrai", courir: "courrai", mourir: "mourrai", acquérir: "acquerrai", cueillir: "cueillerai", mouvoir: "mouvrai", résoudre: "résoudrai", appeler: "appellerai", jeter: "jetterai", acheter: "achèterai", lever: "lèverai", nettoyer: "nettoierai", conclure: "conclurai", bouillir: "bouillirai", naître: "naîtrai", finir: "finirai", haïr: "haïrai", asseoir: "assiérai", créer: "créerai", essuyer: "essuierai", courir_: null };
  for (const [v, f] of Object.entries(fut)) if (f) assert.equal(conjugate(v, "futur", 0), f, v);
  assert.equal(conjugate("falloir", "futur", 2), "faudra");
  assert.equal(conjugate("pleuvoir", "futur", 2), "pleuvra");
  assert.ok(conjugations("céder", "futur", 0).includes("céderai") && conjugations("céder", "futur", 0).includes("cèderai"));
  assert.ok(conjugations("payer", "futur", 0).includes("payerai"));
  assert.ok(conjugations("asseoir", "futur", 0).includes("assoirai"));
  assert.equal(conjugate("vouloir", "cond_present", 0), "voudrais");
  assert.equal(conjugate("falloir", "cond_present", 2), "faudrait");
  assert.equal(conjugate("être", "cond_present", 3), "serions");
  assert.equal(conjugate("avoir", "cond_present", 5), "auraient");
  assert.equal(conjugate("aller", "cond_present", 0), "irais");
});

test("subjonctif présent et imparfait", () => {
  const s = { aller: ["aille", "allions"], être: ["sois", "soyons"], avoir: ["aie", "ayons"], faire: ["fasse", "fassions"], pouvoir: ["puisse", "puissions"], savoir: ["sache", "sachions"], vouloir: ["veuille", "voulions"], valoir: ["vaille", "valions"], prendre: ["prenne", "prenions"], venir: ["vienne", "venions"], voir: ["voie", "voyions"], croire: ["croie", "croyions"], boire: ["boive", "buvions"], devoir: ["doive", "devions"], recevoir: ["reçoive", "recevions"], mourir: ["meure", "mourions"], acquérir: ["acquière", "acquérions"], résoudre: ["résolve", "résolvions"], coudre: ["couse", "cousions"], conclure: ["conclue", "concluions"], fuir: ["fuie", "fuyions"], rire: ["rie", "riions"], envoyer: ["envoie", "envoyions"], céder: ["cède", "cédions"], appeler: ["appelle", "appelions"], finir: ["finisse", "finissions"], haïr: ["haïsse", "haïssions"], craindre: ["craigne", "craignions"] };
  for (const [v, [je, nous]] of Object.entries(s)) {
    assert.equal(conjugate(v, "subj_present", 0), je, `${v} je`);
    assert.equal(conjugate(v, "subj_present", 3), nous, `${v} nous`);
  }
  assert.equal(conjugate("être", "subj_present", 2), "soit");
  assert.equal(conjugate("avoir", "subj_present", 2), "ait");
  assert.equal(conjugate("falloir", "subj_present", 2), "faille");
  assert.equal(conjugate("pleuvoir", "subj_present", 2), "pleuve");
  const si = { être: "fût", avoir: "eût", faire: "fît", prendre: "prît", venir: "vînt", chanter: "chantât", finir: "finît", manger: "mangeât", pouvoir: "pût", savoir: "sût", devoir: "dût", croire: "crût", naître: "naquît", mourir: "mourût", vivre: "vécût", aller: "allât", haïr: "haït" };
  for (const [v, f] of Object.entries(si)) assert.equal(conjugate(v, "subj_imparfait", 2), f, v);
  table("chanter", "subj_imparfait", "chantasse chantasses chantât chantassions chantassiez chantassent");
  table("être", "subj_imparfait", "fusse fusses fût fussions fussiez fussent");
  table("venir", "subj_imparfait", "vinsse vinsses vînt vinssions vinssiez vinssent");
  assert.equal(conjugate("croître", "subj_imparfait", 0), "crusse");
});

test("impératif", () => {
  const imp = (v, opts = {}) => [1, 3, 4].map((p) => conjugate(v, "imp_present", p, opts)).join(" ");
  assert.equal(imp("aller"), "va allons allez");
  assert.equal(imp("être"), "sois soyons soyez");
  assert.equal(imp("avoir"), "aie ayons ayez");
  assert.equal(imp("savoir"), "sache sachons sachez");
  assert.equal(imp("vouloir"), "veuille veuillons veuillez");
  assert.equal(imp("faire"), "fais faisons faites");
  assert.equal(imp("dire"), "dis disons dites");
  assert.equal(imp("chanter"), "chante chantons chantez");
  assert.equal(imp("ouvrir"), "ouvre ouvrons ouvrez");
  assert.equal(imp("cueillir"), "cueille cueillons cueillez");
  assert.equal(imp("finir"), "finis finissons finissez");
  assert.equal(imp("prendre"), "prends prenons prenez");
  assert.equal(imp("lever", { pron: true }), "lève-toi levons-nous levez-vous");
  assert.equal(conjugate("lever", "imp_present", 1, { pron: true, neg: true }), "ne te lève pas");
  assert.equal(conjugate("asseoir", "imp_present", 1, { pron: true }), "assieds-toi");
  assert.equal(conjugate("pouvoir", "imp_present", 1), "");
  assert.equal(conjugate("finir", "imp_passe", 1), "aie fini");
  assert.equal(conjugate("partir", "imp_passe", 4, { g: "f" }), "soyez parties");
});

test("participes et formes nominales", () => {
  const pp = { être: "été", avoir: "eu", aller: "allé", faire: "fait", dire: "dit", prendre: "pris", venir: "venu", tenir: "tenu", mettre: "mis", voir: "vu", prévoir: "prévu", pouvoir: "pu", vouloir: "voulu", savoir: "su", devoir: "dû", recevoir: "reçu", valoir: "valu", falloir: "fallu", plaire: "plu", courir: "couru", mourir: "mort", acquérir: "acquis", ouvrir: "ouvert", offrir: "offert", cueillir: "cueilli", asseoir: "assis", mouvoir: "mû", émouvoir: "ému", résoudre: "résolu", absoudre: "absous", dissoudre: "dissous", coudre: "cousu", moudre: "moulu", conclure: "conclu", inclure: "inclus", exclure: "exclu", clore: "clos", fuir: "fui", vivre: "vécu", suivre: "suivi", vaincre: "vaincu", croire: "cru", croître: "crû", accroître: "accru", boire: "bu", lire: "lu", rire: "ri", suffire: "suffi", confire: "confit", conduire: "conduit", nuire: "nui", luire: "lui", connaître: "connu", naître: "né", peindre: "peint", craindre: "craint", joindre: "joint", rompre: "rompu", rendre: "rendu", battre: "battu", haïr: "haï", finir: "fini", chanter: "chanté", créer: "créé", payer: "payé" };
  for (const [v, f] of Object.entries(pp)) assert.equal(participle(v)[0], f, v);
  assert.deepEqual([participle("devoir", "f")[0], participle("devoir", "m", true)[0], participle("devoir", "f", true)[0]], ["due", "dus", "dues"]);
  assert.deepEqual([participle("absoudre", "f")[0], participle("dissoudre", "f", true)[0]], ["absoute", "dissoutes"]);
  assert.deepEqual([participle("inclure", "f")[0], participle("prendre", "m", true)[0], participle("créer", "f")[0]], ["incluse", "pris", "créée"]);
  assert.equal(participle("être", "f", true)[0], "été");
  const ppr = { être: "étant", avoir: "ayant", savoir: "sachant", faire: "faisant", voir: "voyant", croire: "croyant", boire: "buvant", prendre: "prenant", finir: "finissant", haïr: "haïssant", manger: "mangeant", commencer: "commençant", aller: "allant", résoudre: "résolvant", coudre: "cousant", acquérir: "acquérant", vainquant: null, vaincre: "vainquant", pleuvoir: "pleuvant" };
  for (const [v, f] of Object.entries(ppr)) if (f) assert.equal(nominalForms(v).participePresent, f, v);
  assert.equal(nominalForms("partir").infinitifPasse, "être parti");
  assert.equal(nominalForms("chanter").gerondif, "en chantant");
});

test("temps composés, auxiliaires et accords", () => {
  assert.equal(conjugate("chanter", "passe_compose", 0), "ai chanté");
  assert.equal(conjugate("partir", "passe_compose", 2, { who: "elle" }), "est partie");
  assert.equal(conjugate("venir", "passe_compose", 5), "sont venus");
  assert.equal(conjugate("venir", "passe_compose", 5, { who: "elles" }), "sont venues");
  assert.deepEqual(conjugations("lever", "passe_compose", 3, { pron: true }), ["nous sommes levés", "nous sommes levées"]);
  assert.equal(conjugate("laver", "passe_compose", 2, { pron: true, who: "elle" }), "s'est lavée");
  assert.equal(conjugate("parler", "passe_compose", 5, { pron: true }), "se sont parlé");
  assert.equal(conjugate("succéder", "passe_compose", 5, { pron: true, who: "elles" }), "se sont succédé");
  assert.equal(conjugate("falloir", "passe_compose", 2), "a fallu");
  assert.equal(conjugate("pleuvoir", "plus_que_parfait", 2), "avait plu");
  assert.equal(conjugate("finir", "passe_anterieur", 0), "eus fini");
  assert.equal(conjugate("arriver", "futur_anterieur", 3), "serons arrivés");
  assert.equal(conjugate("être", "subj_plus_que_parfait", 2), "eût été");
  assert.equal(conjugate("venir", "subj_plus_que_parfait", 2, { who: "elle" }), "fût venue");
  assert.equal(conjugate("partir", "subj_passe", 2), "soit parti");
  assert.equal(conjugate("aimer", "cond_passe", 0), "aurais aimé");
  assert.equal(conjugate("souvenir", "passe_compose", 0), "me suis souvenu");
  assert.ok(conjugations("souvenir", "passe_compose", 0).includes("me suis souvenue"));
  assert.ok(conjugations("partir", "passe_compose", 4).includes("êtes parti"), "vous de politesse");
  assert.equal(auxOf("monter"), "être");
  assert.equal(auxOf("monter", { transitive: true }), "avoir");
  assert.equal(conjugate("monter", "passe_compose", 2, { transitive: true }), "a monté");
});

test("négation, élision et inversion", () => {
  assert.equal(conjugate("chanter", "present", 0, { neg: true }), "ne chante pas");
  assert.equal(conjugate("aimer", "present", 0, { neg: true }), "n'aime pas");
  assert.equal(conjugate("habiter", "present", 2, { neg: true }), "n'habite pas");
  assert.equal(conjugate("haïr", "present", 0, { neg: true }), "ne hais pas");
  assert.equal(conjugate("lever", "present", 0, { pron: true, neg: true }), "ne me lève pas");
  assert.equal(conjugate("appeler", "present", 0, { pron: true }), "m'appelle");
  assert.equal(conjugate("lever", "passe_compose", 2, { pron: true, neg: true, who: "elle" }), "ne s'est pas levée");
  assert.equal(conjugate("finir", "passe_compose", 0, { neg: true }), "n'ai pas fini");
  assert.equal(conjugate("manger", "present", 2, { question: true }), "mange-t-il");
  assert.equal(conjugate("aller", "present", 2, { question: true, who: "elle" }), "va-t-elle");
  assert.equal(conjugate("manger", "passe_compose", 2, { question: true }), "a-t-il mangé");
  assert.equal(conjugate("partir", "passe_compose", 2, { question: true, who: "elle" }), "est-elle partie");
  assert.equal(conjugate("lever", "passe_compose", 2, { pron: true, question: true }), "s'est-il levé");
  assert.equal(conjugate("lever", "passe_compose", 2, { pron: true, question: true, neg: true }), "ne s'est-il pas levé");
  assert.equal(conjugate("prendre", "present", 2, { question: true }), "prend-il");
  assert.equal(conjugate("vaincre", "present", 2, { question: true }), "vainc-il");
  assert.equal(conjugate("chanter", "futur", 2, { question: true }), "chantera-t-il");
  assert.equal(conjugate("aimer", "present", 1, { question: true }), "aimes-tu");
  assert.equal(conjugate("venir", "present", 5, { question: true }), "viennent-ils");
  assert.equal(conjugate("chanter", "present", 0, { question: true }), "", "pas d'inversion avec je");
});

test("tableaux avec le sujet", () => {
  assert.equal(withSubject("aimer", "present", 0), "j'aime");
  assert.equal(withSubject("haïr", "present", 0), "je hais");
  assert.equal(withSubject("habiter", "present", 0), "j'habite");
  assert.equal(withSubject("hurler", "present", 0), "je hurle");
  assert.equal(withSubject("avoir", "subj_present", 0), "que j'aie");
  assert.equal(withSubject("avoir", "subj_present", 2), "qu'il ait");
  assert.equal(withSubject("partir", "subj_passe", 2, { who: "elle" }), "qu'elle soit partie");
  assert.equal(withSubject("lever", "present", 0, { pron: true }), "je me lève");
  assert.equal(withSubject("appeler", "present", 0, { pron: true }), "je m'appelle");
  assert.equal(withSubject("lever", "passe_compose", 3, { pron: true }), "nous nous sommes levés");
});

test("toutes les formes existent pour tous les verbes (sauf défectifs)", () => {
  assert.ok(VERBS.length >= 600, `${VERBS.length} verbes`);
  for (const v of VERBS) {
    const F = simpleForms(v.inf);
    assert.ok(F, v.inf);
    if (F.only || F.persons) continue;
    for (const t of ["present", "imparfait", "passe_simple", "futur", "cond_present", "subj_present", "subj_imparfait"]) {
      for (const p of P) {
        const f = F[t][p];
        assert.ok(f?.length && f.every((x) => /^[a-zàâäçéèêëîïôöùûüœ]+$/.test(x)), `${v.inf} ${t} ${p} : ${f}`);
      }
    }
    assert.ok(F.pp?.[0], `${v.inf} participe`);
  }
  assert.equal(verbInfo("se lever")?.inf, "lever");
  assert.equal(TENSES.length, 16);
});

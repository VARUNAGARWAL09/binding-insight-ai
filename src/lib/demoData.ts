import { addWithTimestamp } from './historyStorage';
import { subDays, addDays, startOfDay } from 'date-fns';

const DRUGS = [
    { name: 'Aspirin', smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O' },
    { name: 'Ibuprofen', smiles: 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O' },
    { name: 'Paracetamol', smiles: 'CC(=O)NC1=CC=C(O)C=C1' },
    { name: 'Metformin', smiles: 'CN(C)C(=N)NC(=N)N' },
    { name: 'Simvastatin', smiles: 'CCC(C)(C)C(=O)OC1CC(C=C2C1C(C(C=C2)C)C)CCC3CC(CC(=O)O3)O' },
    { name: 'Atorvastatin', smiles: 'CC(C)C1=C(C(=C(N1CC(CC(=O)O)O)C2=CC=C(C=C2)F)C3=CC=CC=C3)C(=O)NC4=CC=CC=C4' },
    { name: 'Omeprazole', smiles: 'CC1=CN=C(C(=C1OC)C)CS(=O)C2=NC3=C(N2)C=C(C=C3)OC' },
    { name: 'Amoxicillin', smiles: 'CC1(C(N2C(S1)C(C2=O)NC(=O)C(C3=CC=C(C=C3)O)N)C(=O)O)C' },
    { name: 'Lisinopril', smiles: 'C1CC(N(C1)C(=O)C(CCCCN)NC(CCC2=CC=CC=C2)C(=O)O)C(=O)O' },
    { name: 'Amlodipine', smiles: 'CCOC(=O)C1=C(NC(=C(C1C2=CC=CC=C2Cl)C(=O)OC)C)COCCN' },
    { name: 'Metoprolol', smiles: 'CC(C)NCC(COC1=CC=C(C=C1)CCOC)O' },
    { name: 'Losartan', smiles: 'CCCC1=NC(=C(N1CC2=CC=C(C=C2)C3=CC=CC=C3C4=NNN=N4)Cl)CO' },
    { name: 'Azithromycin', smiles: 'CCC1C(C(C(N(CC(CC(C(C(C(C(C(=O)O1)C)OC2CC(C(C(O2)C)O)(C)OC)C)OC3C(C(CC(O3)C)N(C)C)O)(C)O)C)C)O)(C)O' },
    { name: 'Metronidazole', smiles: 'CC1=NC=C(N1CCO)[N+](=O)[O-]' },
    { name: 'Gabapentin', smiles: 'C1(CCCCC1)CC(=O)O.NCC' },
    { name: 'Sertraline', smiles: 'CNC1CCC(C2=CC=CC=C21)C3=CC(=C(C=C3)Cl)Cl' },
    { name: 'Ciprofloxacin', smiles: 'C1CC1N2C=C(C(=O)C3=CC(=C(C=C32)N4CCNCC4)F)C(=O)O' },
    { name: 'Fluoxetine', smiles: 'CNCCC(C1=CC=CC=C1)OC2=CC=C(C=C2)C(F)(F)F' },
    { name: 'Prednisone', smiles: 'CC12CC(C3C(C1CCC2(C(=O)CO)O)CCC4=CC(=O)C=CC43C)O' },
    { name: 'Warfarin', smiles: 'CC(=O)CC(C1=CC=CC=C1)C2=C(C3=CC=CC=C3OC2=O)O' },
    { name: 'Levothyroxine', smiles: 'C1=C(C=C(C(=C1I)OC2=CC(=C(C(=C2)I)O)I)I)CC(C(=O)O)N' },
    { name: 'Cetirizine', smiles: 'C1CN(CCN1CC(=O)O)C(C2=CC=CC=C2)C3=CC=C(C=C3)Cl' },
    { name: 'Albuterol', smiles: 'CC(C)(C)NCC(C1=CC(=C(C=C1)O)CO)O' },
    { name: 'Clopidogrel', smiles: 'COC(=O)C(C1=CC=CC=C1Cl)N2CCC3=C(C2)C=CS3' },
    { name: 'Furosemide', smiles: 'C1=CC(=C(C=C1C(=O)O)S(=O)(=O)N)NCC2=CC=CO2.Cl' }
];

const PROTEINS = [
    { name: 'EGFR', fasta: 'MRPSGTAGAALLALLAALCPASRALEEKKVCQGTSNKLTQLGTFEDHFLSLQRMFNNCEVVLGNLEITYVQRNYDLSFLKTIQEVAGYVLIALNTVERIPLENLQIIRGNMYYENSYALAVLSNYDANKTGLKELPMRNLQEILHGAVRFSNNPALCNVESIQWRDIVSSDFLSNMSMDFQNHLGSCQKCDPSCPNGSCWGAGEENCQKLTKIICAQQCSGRCRGKSPSDCCHNQCAAGCTGPRESDCLVCRKFRDEATCKDTCPPLMLYNPTTYQMDVNPEGKYSFGATCVKKCPRNYVVTDHGSCVRACGADSYEMEEDGVRKCKKCEGPCRKVCNGIGIGEFKDSLSINATNIKHFKNCTSISGDLHILPVAFRGDSFTHTPPLDPQE' },
    { name: 'HER2', fasta: 'MELAALCRWGLLLALLPPGAASTQVCTGTDMKLRLPASPETHLDMLRHLYQGCQVVQGNLELTYLPTNASLSFLQDIQEVQGYVLIAHNQVRQVPLQRLRIVRGTQLFEDNYALAVLDNGDPLNNTTPVTGASPGGLRELQLRSLTEILKGGVLIQRNPQLCYQDTILWKDIFHKNNQLALTLIDTNRSRACHPCSPMCKGSRCWGESSEDCQSLTRTVCAGGCARCKGPLPTDCCHEQCAAGCTGPKHSDCLACLHFNHSGICELHCPALVTYNTDTFESMPNPEGRYTFGASCVTACPYNYLSTDVGSCTLVCPLHNQEVTAEDGTQRCEKCSKPCARVCYGLGMEHLREVRAVTSANIQEFAGCKKIFGSLAFLPESFDGDPASNTAPLQPQE' },
    { name: 'VEGFR2', fasta: 'MQSKVLLAVALWLCVETRAASVGLPSVSLDLPRLSIQKDILTIKANTTLQITCRGQRDLDWLWPNNQSGSEQRVEVTECSDGLFCKTLTIPKVIGNDTGAYKCFYRETDLASVIYVYVQDYRSPFIASVSDQHGVVYITENKNKTVVIPCLGSISNLNVSLCARYPEKRFVPDGNRISWDSKKGFTIPSYMISYAGMVFCEAKINDESYQSIMYIVVVVGYRIYDVVLSPSHGIELSVGEKLVLNCTARTELNVGIDFNWEYPSSKHQHKKLVNRDLKTQSGSEMKKFLSTLTIDGVTRSDQGLYTCAASSGLMTKKNSTFVRVHEKPFVAFGSGMESLVEATVGERVRIPAKYLGYPPPEIKWYKNGIPLESNHTIKAGHVLTIMEVSERDT' },
    { name: 'PD-1', fasta: 'MQIPQAPWPVVWAVLQLGWRPGWFLDSPDRPWNPPTFSPALLVVTEGDNATFTCSFSNTSESFVLNWYRMSPSNQTDKLAAFPEDRSQPGQDCRFRVTQLPNGRDFHMSVVRARRNDSGTYLCGAISLAPKAQIKESLRAELRVTERRAEVPTAHPSPSPRPAGQFQTLVVGVVGGLLGSLVLLVWVLAVICSRAARGTIGARRTGQPLKEDPSAVPVFSVDYGELDFQWREKTPEPPVPCVPEQTEYATIVFPSGMGTSSPARRGSADGPRSAQPLRPEDGHCSWPL' },
    { name: 'Hemoglobin Alpha', fasta: 'MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR' },
    { name: 'Insulin receptor', fasta: 'MATGGRRGAAAAPLLVAVAALLLGAAGHLYPGEVCPGMDIRNNLTRLHELENCSVIEGHLQILLMFKTRPEDFRDLSFPKLIMITDYLLLFRVYGLESLKDLFPNLTVIRGSRLFFNYALVIFEMVHLKELGLYNLMNITRGSVRIEKNNELCYLATIDWSRILDSVEDNYIVLNKDDNEECGDICPGTAKGKTNCPATVINGQFVERCWTHSHCQKVCPTICKSHGCTAEGLCCHSECLGNCSQPDDPTKCVACRNFYLDGRCVETCPPPYYHFQDWRCVNFSFCQDLHHKCKNSRRQGCHQYVIHNNGIPECECGPKCPK' },
    { name: 'p53', fasta: 'MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGPDEAPRMPEAAPPVAPAPAAPTPAAPAPAPSWPLSSSVPSQKTYQGSYGFRLGFLHSGTAKSVTCTYSPALNKMFCQLAKTCPVQLWVDSTPPPGTRVRAMAIYKQSQHMTEVVRRCPHHERCSDSDGLAPPQHLIRVEGNLRVEYLDDRNTFRHSVVVPYEPPEVGSDCTTIHYNYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRNSFEVRVCACPGRDRRTEEENLRKKGEPHHELPPGSTKRALPNNT' },
    { name: 'BRCA1', fasta: 'MDLSALRVEEVQNVINAMQKILECPICLELIKEPVSTKCDHIFCKFCMLKLLNQKKGPSQCPLCKNDITKRSLQESTRFSQLVEELLKIICAFQLDTGLEYANSYNFAKKENNSPEHLKDEVSIIQSMGYRNRAKRLLQSEPENPSLQETSLSVQLSNLGTVRTLRTKQRIQPQKTSVYIELGSDSSEDTVNKATYCSVGDQELLQITPQGTRDEISLDSAKKAACEFSETDVTNTEHHQPSNNDLNTTEKRAAERHPEKYQGSSVSNLHVEPCGTNTHASSLQHENSSLLLTKDRMNVEKAEFCNKSKQPGLARSQHNRWAGSKETCNDRRTPSTEKKVNKKVSQDAF' },
    { name: 'ACE2', fasta: 'MSSSSWLLLSLVAVTAAQSTIEEQAKTFLDKFNHEAEDLFYQSSLASWNYNTNITEENVQNMNNAGDKWSAFLKEQSTLAQMYPLQEIQNLTVKLQLQALQQNGSSVLSEDKSKRLNTILNTMSTIYSTGKVCNPDNPQECLLLEPGLNEIMANSLDYNERLWAWESWRSEVGKQLRPLYEEYVVLKNEMARANHYEDYGDYWRGDYEVNGVDGYDYSRGQLIEDVEHTFEEIKPLYEHLHAYVRAKLMNAYPSYISPIGCLPAHLLGDMWGRFWTNLYSLTVPFGQKPNIDVTDAMVDQAWDAQRIFKEAEKFFVSVGLPNMTQGFWENSMLTDPGNVQKAVCHPTAWDLGKGDFRILMCTKVTMDDFLTAHHEMGHIQYDMAYAAQPFLLRNGANEGFHEAVGEIMSLSAATPKHLKSIGLLSPDFQEDNETEINFLLKQALTIVGTLPFTYMLEKWRWMVFKGEIPKDQWMKKWWEMKREIVGVVEPVPHDETYCDPASLFHVSNDYSFIRYYTRTLYQFQFQEALCQAAKHEGPLHKCDISNSTEAGQKLFNMLRLGKSEPWTLALENVVGAKNMNVRPLLNYFEPLFTWLKDQNKNSFVGWSTDWSPYAD' },
    { name: 'TNF-alpha', fasta: 'MSTESMIRDVELAEEALPKKTGGPQGSRRCLFLSLFSFLIVAGATTLFCLLHFGVIGPQREEFPRDLSLISPLAQAVRSSSRTPSDKPVAHVVANPQAEGQLQWLNRRANALLANGVELRDNQLVVPSEGLYLIYSQVLFKGQGCPSTHVLLTHTISRIAVSYQTKVNLLSAIKSPCQRETPEGAEAKPWYEPIYLGGVFQLEKGDRLSAEINRPDYLDFAESGQVYFGIIAL' }
];

function getRandomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

// Generate realistic looking importances
function generateImportances(sequence: string, count: number) {
    return Array.from({ length: count }, (_, i) => ({
        index: i,
        score: Math.random() * (i % 5 === 0 ? 0.8 : 0.2), // Create some spikes
        symbol: sequence[i % sequence.length]
    })).sort((a, b) => b.score - a.score).slice(0, 10);
}

export async function generateDemoHistory() {
    // Start date: Jan 10, 2026 (assuming current year from context, but let's be safe and use this year)
    // User said "10 jan till now". 
    // "Now" is Feb 6 2026 based on previous messages.
    // So range is Jan 10 2026 - Feb 6 2026.

    // We want unique combinations if possible.
    // There are 25 drugs * 10 proteins = 250 combinations.
    // We'll generate about 30-40 predictions randomly spread across dates.

    const today = new Date(); // Current system time
    const currentYear = today.getFullYear();
    const startDate = new Date(currentYear, 0, 10); // Jan 10

    // Create a pool of all combinations
    const combinations = [];
    for (const drug of DRUGS) {
        for (const protein of PROTEINS) {
            combinations.push({ drug, protein });
        }
    }

    // Shuffle combinations
    for (let i = combinations.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combinations[i], combinations[j]] = [combinations[j], combinations[i]];
    }

    // Take first 50 (or fewer if less days) to populate
    const entriesToCreate = 50;
    const selectedCombinations = combinations.slice(0, entriesToCreate);

    const totalDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

    for (const combo of selectedCombinations) {
        // Random date between start and now
        const randomDayOffset = getRandomInt(0, totalDays);
        const date = addDays(startDate, randomDayOffset);
        // Add random time of day
        date.setHours(getRandomInt(8, 22), getRandomInt(0, 59));

        const predictedPk = getRandomFloat(4, 10);
        // Confidence correlated with pK slightly
        const confidenceScore = Math.min(0.99, Math.max(0.6, predictedPk / 12 + getRandomFloat(-0.1, 0.1)));

        // Generate mock importances
        const atomImportances = generateImportances(combo.drug.smiles, 10).map(x => ({ atom_index: x.index, importance: x.score, symbol: x.symbol }));
        const residueImportances = generateImportances(combo.protein.fasta, 10).map(x => ({ residue_index: x.index, importance: x.score, residue: x.symbol }));

        await addWithTimestamp({
            drugName: combo.drug.name,
            smiles: combo.drug.smiles,
            proteinName: combo.protein.name,
            fasta: combo.protein.fasta,
            predictedPk: parseFloat(predictedPk.toFixed(2)),
            confidenceScore: parseFloat((confidenceScore * 100).toFixed(1)), // Store as 0-100 to match existing convention
            source: Math.random() > 0.3 ? 'batch' : 'single',
            timestamp: date.getTime(),
            isFavorite: Math.random() > 0.8,
            notes: Math.random() > 0.9 ? 'Interesting interaction' : '',
            tags: [],
            atomImportance: atomImportances,
            residueImportance: residueImportances
        });
    }

    console.log(`Generated ${selectedCombinations.length} mock entries.`);
}

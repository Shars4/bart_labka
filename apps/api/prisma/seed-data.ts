import type { Prisma } from '../src/generated/prisma/client.js';

/**
 * Demo animals inserted on the first start. Photos live in the web app under
 * apps/web/public/images/animals. Applicant emails use the reserved
 * example.com domain.
 */
export const demoAnimals: Omit<Prisma.AnimalCreateInput, 'createdBy'>[] = [
  {
    name: 'Bella',
    species: 'DOG',
    breed: 'Labradorský retriever',
    sex: 'FEMALE',
    size: 'LARGE',
    birthDate: new Date('2022-04-12'),
    intakeDate: new Date('2026-02-03'),
    description:
      'Bella je priateľská a hravá sučka, ktorá miluje vodu a dlhé prechádzky. Výborne vychádza s deťmi aj s inými psami, pozná základné povely a v aute je pokojná. Hľadá rodinu, ktorá s ňou bude tráviť veľa času vonku.',
    imageUrl: '/images/animals/bella.jpg',
    isVaccinated: true,
    isNeutered: true,
    status: 'AVAILABLE',
    adoptionRequests: {
      create: [
        {
          fullName: 'Jana Nováková',
          email: 'jana.novakova@example.com',
          phone: '+421 905 123 456',
          message:
            'Dobrý deň, máme rodinný dom so záhradou a dve deti, ktoré sa na psa veľmi tešia. Radi by sme Bellu spoznali osobne.',
        },
        {
          fullName: 'Peter Horváth',
          email: 'peter.horvath@example.com',
          message:
            'Behávam každý deň a hľadám aktívneho parťáka. Bella vyzerá ako ideálna spoločníčka na výlety.',
        },
      ],
    },
  },
  {
    name: 'Max',
    species: 'DOG',
    breed: 'Nemecký ovčiak',
    sex: 'MALE',
    size: 'LARGE',
    birthDate: new Date('2020-09-01'),
    intakeDate: new Date('2025-11-20'),
    description:
      'Max je inteligentný a verný pes, ktorý potrebuje skúseného majiteľa a dostatok pohybu. Rád sa učí nové veci a najlepšie sa bude cítiť v dome so záhradou.',
    imageUrl: '/images/animals/max.jpg',
    isVaccinated: true,
    isNeutered: false,
    status: 'AVAILABLE',
  },
  {
    name: 'Luna',
    species: 'DOG',
    breed: 'Kríženec',
    sex: 'FEMALE',
    size: 'MEDIUM',
    birthDate: new Date('2024-01-15'),
    intakeDate: new Date('2026-05-10'),
    description:
      'Luna sa k nám dostala ako túlavé šteňa. Je zvedavá, učenlivá a plná energie. Hľadá aktívnu rodinu, ktorá ju naučí všetko potrebné.',
    imageUrl: '/images/animals/luna.jpg',
    isVaccinated: true,
    isNeutered: true,
    status: 'AVAILABLE',
  },
  {
    name: 'Rocky',
    species: 'DOG',
    breed: 'Jack Russell teriér',
    sex: 'MALE',
    size: 'SMALL',
    birthDate: new Date('2019-06-20'),
    intakeDate: new Date('2026-01-08'),
    description:
      'Rocky je malý pes s veľkým srdcom. Je veselý, hravý a vždy pripravený na dobrodružstvo. Momentálne je rezervovaný pre rodinu, ktorá si ho prišla pozrieť.',
    imageUrl: '/images/animals/rocky.jpg',
    isVaccinated: true,
    isNeutered: true,
    status: 'RESERVED',
  },
  {
    name: 'Daisy',
    species: 'DOG',
    breed: 'Bígel',
    sex: 'FEMALE',
    size: 'MEDIUM',
    birthDate: new Date('2018-03-03'),
    intakeDate: new Date('2025-09-14'),
    description:
      'Daisy je milá a pokojná sučka, ktorá miluje maškrty a spoločnosť ľudí. Už si našla nový domov.',
    imageUrl: '/images/animals/daisy.jpg',
    isVaccinated: true,
    isNeutered: true,
    status: 'ADOPTED',
    adoptionRequests: {
      create: [
        {
          fullName: 'Tomáš Varga',
          email: 'tomas.varga@example.com',
          phone: '+421 911 222 333',
          message:
            'Pracujem z domu a mám veľa času na prechádzky. Daisy by u nás mala pokojný domov.',
          status: 'APPROVED',
        },
        {
          fullName: 'Lucia Balážová',
          email: 'lucia.balazova@example.com',
          message: 'Mám rada bíglov a rada by som si Daisy adoptovala.',
          status: 'REJECTED',
        },
        {
          fullName: 'Jana Nováková',
          email: 'jana.novakova@example.com',
          message:
            'Daisy by sa u nás mala dobre, deti sa na ňu už teraz tešia.',
          status: 'REJECTED',
        },
      ],
    },
  },
  {
    name: 'Bruno',
    species: 'DOG',
    breed: 'Kríženec',
    sex: 'MALE',
    size: 'LARGE',
    birthDate: new Date('2016-11-30'),
    intakeDate: new Date('2026-03-22'),
    description:
      'Bruno je pokojný senior, ktorý už nepotrebuje veľa pohybu. Ocení mäkký pelech, krátke prechádzky a človeka, ktorý mu dopraje pokojnú jeseň života.',
    imageUrl: '/images/animals/bruno.jpg',
    isVaccinated: true,
    isNeutered: true,
    status: 'AVAILABLE',
  },
  {
    name: 'Micka',
    species: 'CAT',
    breed: 'Európska krátkosrstá',
    sex: 'FEMALE',
    size: 'SMALL',
    birthDate: new Date('2021-05-05'),
    intakeDate: new Date('2026-04-02'),
    description:
      'Micka je nežná mačička, ktorá si najradšej ľahne do lona a pradie. Je zvyknutá na byt a s inými mačkami vychádza bez problémov.',
    imageUrl: '/images/animals/micka.jpg',
    isVaccinated: true,
    isNeutered: true,
    status: 'AVAILABLE',
  },
  {
    name: 'Oskar',
    species: 'CAT',
    breed: 'Mainská mývalia',
    sex: 'MALE',
    size: 'MEDIUM',
    birthDate: new Date('2022-08-18'),
    intakeDate: new Date('2026-06-11'),
    description:
      'Oskar je veľký a pokojný kocúr s huňatým chvostom. Je zvedavý, prítulný a rád sleduje dianie z parapety.',
    imageUrl: '/images/animals/oskar.jpg',
    isVaccinated: true,
    isNeutered: true,
    status: 'AVAILABLE',
    adoptionRequests: {
      create: [
        {
          fullName: 'Martina Kováčová',
          email: 'martina.kovacova@example.com',
          phone: '+421 948 765 432',
          message:
            'Bývame v priestrannom byte a Oskar by u nás mal vlastnú parapetu s výhľadom do parku.',
        },
      ],
    },
  },
  {
    name: 'Lucka',
    species: 'CAT',
    breed: 'Britská krátkosrstá',
    sex: 'FEMALE',
    size: 'SMALL',
    birthDate: new Date('2023-02-10'),
    intakeDate: new Date('2025-12-01'),
    description:
      'Lucka je elegantná a nenáročná mačička, ktorá si rýchlo zvykne na nové prostredie. Už má nový domov.',
    imageUrl: '/images/animals/lucka.jpg',
    isVaccinated: true,
    isNeutered: true,
    status: 'ADOPTED',
    adoptionRequests: {
      create: [
        {
          fullName: 'Eva Szabová',
          email: 'eva.szabova@example.com',
          message:
            'Hľadáme pokojnú mačku do bytu, Lucka by k nám skvelo zapadla.',
          status: 'APPROVED',
        },
      ],
    },
  },
  {
    name: 'Tigrík',
    species: 'CAT',
    breed: 'Kríženec',
    sex: 'MALE',
    size: 'SMALL',
    birthDate: new Date('2026-04-20'),
    intakeDate: new Date('2026-08-05'),
    description:
      'Tigrík je pruhované mačiatko plné energie. Hrá sa so všetkým, čo sa hýbe, a v noci rád spí na vankúši.',
    imageUrl: '/images/animals/tigrik.jpg',
    isVaccinated: false,
    isNeutered: false,
    status: 'AVAILABLE',
  },
  {
    name: 'Ňufko',
    species: 'RABBIT',
    breed: 'Zakrslý baranček',
    sex: 'MALE',
    size: 'SMALL',
    birthDate: new Date('2025-03-01'),
    intakeDate: new Date('2026-07-15'),
    description:
      'Ňufko je kľudný zajačik s ovisnutými ušami. Miluje seno a čerstvú zeleninu a rád sa nechá pohladkať.',
    imageUrl: '/images/animals/nufko.jpg',
    isVaccinated: true,
    isNeutered: true,
    status: 'AVAILABLE',
  },
  {
    name: 'Pepe',
    species: 'OTHER',
    breed: 'Morča',
    sex: 'MALE',
    size: 'SMALL',
    birthDate: new Date('2025-06-10'),
    intakeDate: new Date('2026-09-01'),
    description:
      'Pepe je zvedavé morča, ktoré veselo pišťí, keď počuje šuchot vrecka so zeleninou. Je rezervovaný pre jednu školskú triedu.',
    imageUrl: '/images/animals/pepe.jpg',
    isVaccinated: false,
    isNeutered: false,
    status: 'RESERVED',
  },
];

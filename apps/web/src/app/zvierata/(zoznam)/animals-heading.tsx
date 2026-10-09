/** Shared by the page and its loading state, so the heading never jumps. */
export function AnimalsHeading() {
  return (
    <>
      <h1 className="text-5xl md:text-6xl">Zvieratá na adopciu</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Každé z nich čaká na niekoho, kto mu dá domov. Kliknite na zviera a
        dozviete sa o ňom viac.
      </p>
    </>
  );
}

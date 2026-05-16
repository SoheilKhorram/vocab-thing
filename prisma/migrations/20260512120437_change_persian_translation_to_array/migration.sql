/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Word" (
    "id" SERIAL NOT NULL,
    "englishTerm" TEXT NOT NULL,
    "persianTranslations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartOfSpeech" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "wordId" INTEGER NOT NULL,

    CONSTRAINT "PartOfSpeech_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExampleSentence" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "wordId" INTEGER NOT NULL,

    CONSTRAINT "ExampleSentence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Definition" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "wordId" INTEGER NOT NULL,

    CONSTRAINT "Definition_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PartOfSpeech" ADD CONSTRAINT "PartOfSpeech_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExampleSentence" ADD CONSTRAINT "ExampleSentence_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Definition" ADD CONSTRAINT "Definition_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

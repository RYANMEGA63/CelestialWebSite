-- Table pour les pages légales éditables
CREATE TABLE public.legal_pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read legal_pages"
ON public.legal_pages FOR SELECT TO public USING (true);

CREATE POLICY "Auth write legal_pages"
ON public.legal_pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insertions initiales : contenu actuel du site
INSERT INTO public.legal_pages (slug, title, content) VALUES
('mentions-legales', 'Mentions légales', '1. Éditeur du site
Le site celestial.dz est édité par la société Celestial, société par actions simplifiée au capital de 1 000 000 DZD, immatriculée au Registre du Commerce de Sétif sous le numéro RC W4200000.

Siège social : 123 Rue de l''Innovation, 19000 Sétif, Algérie
Email : contact@celestial.dz
Directeur de la publication : le Président de Celestial.

2. Hébergement
Le site est hébergé par un prestataire d''hébergement professionnel. Pour toute demande relative à l''hébergement, veuillez nous contacter à l''adresse contact@celestial.dz.

3. Propriété intellectuelle
L''ensemble des éléments constituant le site (textes, graphiques, logiciels, photographies, images, sons, plans, noms, logos, marques, créations et œuvres protégeables diverses, bases de données…) sont la propriété exclusive de Celestial ou de ses partenaires.

Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sauf autorisation écrite préalable de Celestial.

4. Limitation de responsabilité
Celestial s''efforce d''assurer au mieux de ses possibilités l''exactitude et la mise à jour des informations diffusées sur ce site. Cependant, Celestial ne peut garantir l''exactitude, la précision ou l''exhaustivité des informations mises à disposition.

5. Liens hypertextes
La mise en place de liens hypertextes par des tiers vers des pages ou des documents diffusés sur le site de Celestial est autorisée sous réserve que les liens ne contreviennent pas aux intérêts de Celestial.

6. Droit applicable
Les présentes mentions légales sont soumises au droit algérien. En cas de litige, les tribunaux algériens seront seuls compétents.'),

('confidentialite', 'Politique de confidentialité', '1. Responsable du traitement
Celestial, société par actions simplifiée, dont le siège social est situé au 123 Rue de l''Innovation, 19000 Sétif, Algérie, est responsable du traitement de vos données personnelles collectées via le site celestial.dz.

Contact : contact@celestial.dz

2. Données collectées
Lors de votre utilisation du site et notamment via le formulaire de contact, nous pouvons collecter les données suivantes :

• Nom et prénom
• Adresse email professionnelle
• Nom de l''entreprise
• Numéro de téléphone (optionnel)
• Contenu de votre message

Ces données sont collectées uniquement sur la base de votre consentement explicite.

3. Finalités du traitement
Vos données personnelles sont utilisées pour :

• Répondre à vos demandes de contact ou d''information
• Vous faire parvenir des informations sur nos offres (si vous y avez consenti)
• Améliorer nos services et l''expérience utilisateur
• Respecter nos obligations légales

4. Durée de conservation
Vos données sont conservées pendant la durée nécessaire à la finalité pour laquelle elles ont été collectées :

• Données de contact : 3 ans à compter du dernier contact
• Données clients : durée de la relation contractuelle + 5 ans

5. Vos droits
Conformément à la réglementation applicable, vous disposez des droits suivants concernant vos données personnelles :

• Droit d''accès : obtenir une copie de vos données
• Droit de rectification : corriger des données inexactes
• Droit à l''effacement : demander la suppression de vos données
• Droit d''opposition : vous opposer à un traitement

Pour exercer ces droits, contactez-nous à : contact@celestial.dz

6. Cookies
Le site celestial.dz utilise des cookies techniques strictement nécessaires au fonctionnement du site. Aucun cookie publicitaire ou de tracking n''est utilisé sans votre consentement préalable.

7. Sécurité
Celestial met en œuvre toutes les mesures techniques et organisationnelles appropriées pour protéger vos données contre la perte, l''accès non autorisé, la divulgation ou la modification.'),

('cgu', 'Conditions générales d''utilisation', '1. Objet
Les présentes Conditions Générales d''Utilisation (CGU) ont pour objet de définir les modalités et conditions dans lesquelles Celestial met à disposition ses services logiciels et son site celestial.dz, ainsi que les droits et obligations des parties dans ce cadre.

2. Acceptation des CGU
L''accès et l''utilisation du site et des services Celestial impliquent l''acceptation pleine et entière des présentes CGU. Si vous n''acceptez pas ces conditions, vous devez cesser toute utilisation du site et des services.

3. Description des services
Celestial propose des solutions logicielles pour entreprises, incluant notamment :

• Logiciels de gestion d''entreprise (ERP, CRM)
• Solutions de gestion de bases de données
• Services d''intégration et de déploiement
• Support technique et formation
• Consulting et accompagnement

4. Accès aux services
L''accès aux services nécessite la création d''un compte utilisateur. L''utilisateur s''engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants de connexion.

5. Obligations de l''utilisateur
L''utilisateur s''engage à utiliser les services de Celestial dans le respect des lois et réglementations en vigueur et à ne pas porter atteinte aux droits de propriété intellectuelle de Celestial.

6. Tarification et paiement
Les tarifs des services Celestial sont indiqués en Dinars Algériens (DZD) et sont disponibles sur la page Offres du site. Celestial se réserve le droit de modifier ses tarifs avec un préavis de 30 jours.

7. Disponibilité et maintenance
Celestial s''engage à maintenir une disponibilité des services de 99,5% par mois (hors maintenances planifiées). Les maintenances planifiées sont notifiées avec un préavis de 48h minimum.

8. Limitation de responsabilité
La responsabilité de Celestial est limitée au montant des sommes effectivement perçues au cours des 12 derniers mois.

9. Résiliation
Chaque partie peut résilier le contrat de services avec un préavis de 30 jours par email à contact@celestial.dz.

10. Droit applicable et juridiction
Les présentes CGU sont régies par le droit algérien. Tout litige relève de la compétence exclusive des tribunaux de Sétif, Algérie.');

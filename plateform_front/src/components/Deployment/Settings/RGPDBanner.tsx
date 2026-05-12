import Button from "components/System/Atoms/Button";
import Banner from "components/System/Atoms/Banner";

export const RGPDBanner = () => {
    return (
        <Banner variant="green" title="Conformité RGPD" flexShrink={0}>
            Votre déploiement est conforme au RGPD. Les données des utilisateurs
            ne sont pas utilisées à des fins de formation et sont hébergées en
            Europe.{" "}
            <Button variant="link" ml={2}>
                En savoir plus
            </Button>
        </Banner>
    );
};

export default RGPDBanner;

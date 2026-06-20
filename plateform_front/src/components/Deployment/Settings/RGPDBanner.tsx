import Button from "components/ui/Button";
import Banner from "components/ui/Banner";
import { useNavigate } from "react-router-dom";

export const RGPDBanner = () => {
    const navigate = useNavigate();

    return (
        <Banner variant="green" title="Conformité RGPD" flexShrink={0}>
            Votre déploiement est conforme au RGPD. Les données des utilisateurs ne sont pas utilisées à des fins de
            formation et sont hébergées en Europe.{" "}
            <Button variant="link" ml={2} onClick={() => navigate("/legal/privacy")}>
                En savoir plus
            </Button>
        </Banner>
    );
};

export default RGPDBanner;

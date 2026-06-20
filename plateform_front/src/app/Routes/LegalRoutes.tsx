import { Route } from "react-router-dom";
import { LegalLayout, LegalRedirect } from "pages/Legal";
import { PrivacyPage } from "pages/Legal/PrivacyPage";
import { TermsPage } from "pages/Legal/TermsPage";
import { NoticesPage } from "pages/Legal/NoticesPage";
import { ContactPage } from "pages/Legal/ContactPage";

export const LegalRoutes = () => (
    <Route path="/legal" element={<LegalLayout />}>
        <Route index element={<LegalRedirect />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="notices" element={<NoticesPage />} />
        <Route path="contact" element={<ContactPage />} />
    </Route>
);

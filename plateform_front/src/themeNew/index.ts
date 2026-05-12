import { extendTheme, ThemeConfig } from "@chakra-ui/react";

import Accordion from "themeNew/components/accordion";
import Badge from "themeNew/components/badge";
import Button from "themeNew/components/button";
import Card from "themeNew/components/card";
import Drawer from "themeNew/components/drawer";
import { Menu } from "themeNew/components/menu";
import Modal from "themeNew/components/modal";
import Popover from "themeNew/components/popover";
import Progress from "themeNew/components/progress";
import { tableTheme } from "themeNew/components/table";
// import Progress from 'theme/components/progress';
import Tabs from "themeNew/components/tabs";
import blur from "themeNew/foundations/blur";
import borderRadius from "themeNew/foundations/borderRadius";
import borderWidth from "themeNew/foundations/borderWidth";
import colors from "themeNew/foundations/colors";
import fonts from "themeNew/foundations/fonts";
import Heading from "themeNew/foundations/heading";
import { customsToken, spacing } from "themeNew/foundations/spacing";
import Text from "themeNew/foundations/text";

// import Badge from './components/badge';
// import Button from './components/button';
// import Card from './components/card';
import Checkbox from "./components/checkbox";
import Divider from "./components/divider";
import Form from "./components/form";
import FormError from "./components/form-error-message";
import FormLabel from "./components/form-label";
import Input from "./components/input";
// import Link from './components/link';
// import NumberInput from './components/number-input';
import PinInput from "./components/pin-input";
import Radio from "./components/radio";
import { Slider } from "./components/slider";
// import Select from './components/select';
// import Slider from './components/slider';
// import Stepper from './components/stepper';
import Switch from "./components/switch";
import Stepper from "themeNew/components/stepper";
import { shadow } from "./foundations/shadow";

import "./index.scss";
import colorTokens from "themeNew/foundations/colorTokens";
import Textarea from "themeNew/components/textarea";

const config: ThemeConfig = {
    initialColorMode: "dark",
    useSystemColorMode: false,
};

const breakpoints = {
    sm: "576px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1440px",
    "3xl": "1921px",
};

const overrides = {
    config,
    // Foundations
    breakpoints,
    colors,
    blur,
    borderWidth,
    fonts,
    boxShadow: shadow,

    radii: borderRadius,
    space: spacing,
    semanticTokens: {
        space: customsToken,
        colors: colorTokens,
    },

    // Components
    components: {
        Radio,
        Card,
        Checkbox,
        Badge,
        // Select,
        PinInput,
        Popover,
        Button,
        Text,
        Heading,

        Table: tableTheme,
        Progress,

        FormLabel,
        FormError,
        Form,
        Input,
        // Link,
        Slider,
        // NumberInput,
        // Tag,
        Accordion,
        Menu,
        Tabs,
        // Stepper,
        Switch,
        // Progress,
        Drawer,
        Modal,
        Divider,
        Stepper,
        // Tooltip,
        Textarea,
    },
};

export default extendTheme(overrides);

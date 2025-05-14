import React, { useContext, useState } from "react";
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Container,
    InputAdornment,
    IconButton,
    LinearProgress,
    FormHelperText,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from 'react-router-dom';
import { notification } from "antd";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { loginApi } from "../util/api";
import { AuthContext } from "../components/context/auth.context";

// Styled components
const StyledContainer = styled(Container)(({ theme }) => (({
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8F0",
    padding: theme.spacing(3),
})));

const StyledCard = styled(Card)(({ theme }) => (({
    padding: theme.spacing(4),
    width: "100%",
    maxWidth: 450,
    borderRadius: 16,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    border: "1px solid #FFE4D6",
})));

const Logo = styled("img")({
    width: 250,
    height: 250,
    marginBottom: 20,
    objectFit: "contain",
});

const StyledButton = styled(Button)({
    background: "linear-gradient(45deg, #D3212D 30%, #F47C3C 90%)",
    borderRadius: 8,
    border: 0,
    color: "white",
    height: 48,
    padding: "0 30px",
    boxShadow: "0 3px 5px 2px rgba(211, 33, 45, .3)",
    transition: "all 0.3s ease",
    "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 6px 10px 4px rgba(211, 33, 45, .3)",
    },
});

// Main component
const LoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Object.values(formData).every(Boolean)) {
            setLoading(true);
            const { email, password } = formData;
            try {
                const res = await loginApi(email, password);
                if (res && res.statusCode === 201) {
                    localStorage.setItem("access_token", res.data.access_token);
                    notification.success({
                        message: "LOGIN USER",
                        description: "Successfully logged in"
                    });
                    setAuth({
                        isAuthenticated: true,
                        account: {
                            account_id: res?.user?.account_id ?? "",
                            role: res?.user?.role ?? "",
                            email: res?.user?.email ?? "",
                        }
                    })
                    navigate("/");
                } else {
                    notification.error({
                        message: "LOGIN USER",
                        description: "Password or email is incorrect"
                    })
                }
            } catch (error) {
                console.error('API error:', error);
                notification.error({
                    message: "Sign in fail",
                    description: "Sign in again"
                })
            } finally {
                setTimeout(() => {
                    setLoading(false);
                    console.log("Form submitted:", formData);
                }, 2000);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    return (
        <StyledContainer maxWidth="xl">
            <Logo
                src="/logo_project2.png"
                alt="Company Logo"
            />
            <StyledCard>
                <Typography variant="h4" align="center" gutterBottom sx={{ color: "#D3212D" }}>
                    User Login
                </Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        name="email"
                        label="Email"
                        variant="outlined"
                        value={formData.email}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FaEnvelope color="#D3212D" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        name="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        variant="outlined"
                        value={formData.password}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FaLock color="#D3212D" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <StyledButton
                        type="submit"
                        fullWidth
                        disabled={loading || !Object.values(formData).every(Boolean)}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {loading ? "Signing in Account..." : "Sign in"}
                    </StyledButton>

                    <Typography align="center" sx={{ mt: 2 }}>
                        Don't you have an account?{" "}
                        <Button
                            color="primary"
                            sx={{ textTransform: "none", color: "#D3212D" }}
                            onClick={() => navigate("/register")}
                        >
                            Sign up
                        </Button>
                    </Typography>
                </form>
            </StyledCard>
        </StyledContainer>
    );
};

export default LoginPage;
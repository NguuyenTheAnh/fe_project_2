import React, { useState } from "react";
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
import '../styles/register.css';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { createUserApi } from "../util/api";

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

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.match(/[A-Z]/)) strength += 25;
        if (password.match(/[0-9]/)) strength += 25;
        if (password.match(/[^A-Za-z0-9]/)) strength += 25;
        return strength;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        let newErrors = { ...errors };

        switch (name) {
            case "email":
                newErrors.email = validateEmail(value) ? "" : "Invalid email format";
                break;
            case "password":
                newErrors.password = value.length < 8 ? "Password must be at least 8 characters" : "";
                if (formData.confirmPassword && value !== formData.confirmPassword) {
                    newErrors.confirmPassword = "Passwords do not match";
                }
                break;
            case "confirmPassword":
                newErrors.confirmPassword = value !== formData.password ? "Passwords do not match" : "";
                break;
            case "role":
                newErrors.role = value ? "" : "Please select a role";
                break;
            default:
                break;
        }

        setErrors(newErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!Object.values(errors).some(Boolean) && Object.values(formData).every(Boolean)) {
            setLoading(true);
            // Simulated API call
            const { email, password, role } = formData;
            try {
                const res = await createUserApi(email, password, role);

                if (res) {
                    notification.success({
                        message: "CREATE USER",
                        description: "Success"
                    });
                    navigate("/login");

                } else {
                    notification.error({
                        message: "CREATE USER",
                        description: "error"
                    })
                }
            } catch (error) {
                console.error('API error:', error);
                notification.error({
                    message: "Register fail",
                    description: "Sign up again"
                })
            } finally {
                setTimeout(() => {
                    setLoading(false);
                    console.log("Form submitted:", formData);
                }, 2000);
            }
        }
    };

    const passwordStrength = calculatePasswordStrength(formData.password);

    return (
        <StyledContainer>
            <Logo
                src="../public/logo_project2.png"
                alt="Company Logo"
            />
            <StyledCard>
                <Typography variant="h4" align="center" gutterBottom sx={{ color: "#D3212D" }}>
                    Create Account
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
                        error={Boolean(errors.email)}
                        helperText={errors.email}
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
                        error={Boolean(errors.password)}
                        helperText={errors.password}
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

                    {formData.password && (
                        <Box sx={{ mb: 2 }}>
                            <LinearProgress
                                variant="determinate"
                                value={passwordStrength}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: "#FFE4D6",
                                    "& .MuiLinearProgress-bar": {
                                        backgroundColor: passwordStrength > 75 ? "#4CAF50" : passwordStrength > 50 ? "#FFA726" : "#F44336",
                                    },
                                }}
                            />
                            <FormHelperText>
                                Password strength: {passwordStrength >= 75 ? "Strong" : passwordStrength >= 50 ? "Medium" : "Weak"}
                            </FormHelperText>
                        </Box>
                    )}

                    <TextField
                        fullWidth
                        margin="normal"
                        name="confirmPassword"
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        variant="outlined"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={Boolean(errors.confirmPassword)}
                        helperText={errors.confirmPassword}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FaLock color="#D3212D" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="role-label">Role</InputLabel>
                        <Select
                            labelId="role-label"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            label="Role"
                        >
                            <MenuItem value={"Employee"}>Employee</MenuItem>
                            <MenuItem value={"Manager"}>Manager</MenuItem>
                        </Select>
                    </FormControl>

                    <StyledButton
                        type="submit"
                        fullWidth
                        disabled={loading || Object.values(errors).some(Boolean) || !Object.values(formData).every(Boolean)}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </StyledButton>

                    <Typography align="center" sx={{ mt: 2 }}>
                        Already have an account?{" "}
                        <Button
                            color="primary"
                            sx={{ textTransform: "none", color: "#D3212D" }}
                            onClick={() => navigate("/login")}
                        >
                            Log in
                        </Button>
                    </Typography>
                </form>
            </StyledCard>
        </StyledContainer>
    );
};

export default RegisterPage;
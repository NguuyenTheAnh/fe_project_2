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
import { useNavigate, useSearchParams } from 'react-router-dom';
import { notification } from "antd";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaUser } from "react-icons/fa";
import { loginApi } from "../util/api";
import { AuthContext } from "../components/context/auth.context";
import { loginGuestApi } from "../util/apiGuest";
import Guest from "../Guest";
import { GuestAuthContext } from "../components/context/guest.context";

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
const LoginGuestPage = () => {
    const navigate = useNavigate();
    const { setGuestAuth } = useContext(GuestAuthContext);
    const [formData, setFormData] = useState({
        guest_name: ""
    });
    const [loading, setLoading] = useState(false);

    //Get table id
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('table_id');

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Object.values(formData).every(Boolean)) {
            setLoading(true);
            const { guest_name } = formData;
            try {
                const res = await loginGuestApi(guest_name, tableId);
                if (res && res.statusCode === 201) {
                    localStorage.setItem("access_token_guest", res.data.access_token_guest);
                    notification.success({
                        message: "LOGIN GUEST",
                        description: "Successfully logged in",
                        placement: "bottomRight",
                    });
                    setGuestAuth({
                        isGuestAuthenticated: true,
                        guest: {
                            guest_id: res?.data?.guest?.guest_id ?? "",
                            guest_name: res?.data?.guest?.guest_name ?? "",
                            table_id: res?.data?.guest?.table_id ?? "",
                            cart_id: res?.data?.guest?.cart_id ?? "",
                            table_name: res?.data?.guest?.table?.table_name ?? "",
                        }
                    })
                    navigate(`/guest?table_id=${tableId}`);
                } else {
                    notification.error({
                        message: "LOGIN GUEST",
                        description: "Error login guest", placement: "bottomRight",
                    })
                }
            } catch (error) {
                console.error('API error:', error);
                notification.error({
                    message: "Sign in fail",
                    description: "Sign in again", placement: "bottomRight",
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
                    Guest Name
                </Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        name="guest_name"
                        label="Guest Name"
                        variant="outlined"
                        value={formData.email}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FaUser color="#D3212D" />
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
                        {loading ? "Waiting..." : "Next"}
                    </StyledButton>
                </form>
            </StyledCard>
        </StyledContainer>
    );
};

export default LoginGuestPage;
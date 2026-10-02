import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Alert,
    Button,
    Card,
    Col,
    Empty,
    Pagination,
    Row,
    Space,
    Spin,
    Tag,
    Typography,
} from "antd";
import {
    CalendarOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    FileTextOutlined,
    UserOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const OBSERVATION_BASE_URL = import.meta.env.VITE_OBSERVATION_URL;

const OrganObservations = ({ organId, organName }) => {
    const [observations, setObservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 12,
        total: 0,
        from: null,
        to: null,
    });

    const themeColor = "#214a78";

    useEffect(() => {
        if (!organId) {
            return;
        }

        fetchObservations(1);
    }, [organId]);

    const fetchObservations = async (page = 1) => {
        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.get(
                `${OBSERVATION_BASE_URL}/api/references/organ/${organId}/observations`,
                {
                    params: {
                        page,
                    },
                }
            );

            const observationData = data?.observations;

            setObservations(
                Array.isArray(observationData?.data)
                    ? observationData.data
                    : []
            );

            setPagination({
                currentPage: observationData?.current_page || 1,
                lastPage: observationData?.last_page || 1,
                perPage: observationData?.per_page || 12,
                total: observationData?.total || 0,
                from: observationData?.from || null,
                to: observationData?.to || null,
            });
        } catch (err) {
            console.error("Failed to load organ observations:", err);

            setObservations([]);

            setError(
                err?.response?.data?.message ||
                "Failed to load approved observations."
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchObservations(page);

        setTimeout(() => {
            document
                .getElementById("organ-approved-observations")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
        }, 100);
    };

    const formatDate = (value) => {
        if (!value) {
            return null;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatSubmissionType = (value) => {
        if (!value) {
            return "Observation";
        }

        return value
            .replace(/_/g, " ")
            .replace(/\b\w/g, (character) => character.toUpperCase());
    };

    return (
        <div
            id="organ-approved-observations"
            style={{
                marginTop: 32,
                marginBottom: 32,
                scrollMarginTop: 24,
            }}
        >
            {/* Section Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 20,
                }}
            >
                <div>
                    <Title
                        level={3}
                        style={{
                            marginBottom: 4,
                            color: themeColor,
                        }}
                    >
                        <FileTextOutlined
                            style={{
                                marginRight: 10,
                            }}
                        />

                        Approved Observations
                    </Title>

                    {!loading && !error && (
                        <Text type="secondary">
                            {pagination.total > 0
                                ? `${pagination.total} approved ${
                                    pagination.total === 1
                                        ? "observation"
                                        : "observations"
                                } related to ${
                                    organName || "this organ or tissue"
                                }`
                                : `Approved observations related to ${
                                    organName || "this organ or tissue"
                                }`}
                        </Text>
                    )}
                </div>

                {!loading && pagination.total > 0 && (
                    <Tag
                        style={{
                            margin: 0,
                            borderRadius: 20,
                            padding: "5px 14px",
                            backgroundColor: `${themeColor}10`,
                            borderColor: `${themeColor}30`,
                            color: themeColor,
                            fontSize: 14,
                        }}
                    >
                        {pagination.total} Observations
                    </Tag>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div
                    style={{
                        minHeight: 220,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Spin
                        size="large"
                        tip="Loading approved observations..."
                    />
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <Alert
                    type="error"
                    showIcon
                    message="Unable to load observations"
                    description={error}
                    action={
                        <Button
                            size="small"
                            onClick={() =>
                                fetchObservations(
                                    pagination.currentPage || 1
                                )
                            }
                        >
                            Try Again
                        </Button>
                    }
                    style={{
                        marginBottom: 24,
                    }}
                />
            )}

            {/* Empty */}
            {!loading &&
                !error &&
                observations.length === 0 && (
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 16,
                            backgroundColor: "#fafafa",
                        }}
                    >
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <Text type="secondary">
                                    No approved observations are currently
                                    available for{" "}
                                    {organName || "this organ or tissue"}.
                                </Text>
                            }
                        />
                    </Card>
                )}

            {/* Cards */}
            {!loading &&
                !error &&
                observations.length > 0 && (
                    <>
                        <Row gutter={[20, 20]}>
                            {observations.map((observation) => {
                                const publishedDate = formatDate(
                                    observation.published_at ||
                                    observation.approved_at
                                );

                                return (
                                    <Col
                                        xs={24}
                                        md={12}
                                        key={observation.id}
                                    >
                                        <Card
                                            bordered
                                            hoverable
                                            style={{
                                                height: "100%",
                                                borderRadius: 16,
                                                border: "1px solid #e8edf3",
                                                overflow: "hidden",
                                            }}
                                            bodyStyle={{
                                                height: "100%",
                                                padding: 22,
                                                display: "flex",
                                                flexDirection: "column",
                                            }}
                                        >
                                            {/* Type + Date */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                    flexWrap: "wrap",
                                                    gap: 8,
                                                    marginBottom: 14,
                                                }}
                                            >
                                                <Tag
                                                    icon={<UserOutlined />}
                                                    style={{
                                                        margin: 0,
                                                        borderRadius: 20,
                                                        padding: "3px 10px",
                                                        color: themeColor,
                                                        backgroundColor:
                                                            `${themeColor}0D`,
                                                        borderColor:
                                                            `${themeColor}25`,
                                                    }}
                                                >
                                                    {formatSubmissionType(
                                                        observation.submission_type
                                                    )}
                                                </Tag>

                                                {publishedDate && (
                                                    <Text
                                                        type="secondary"
                                                        style={{
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        <CalendarOutlined
                                                            style={{
                                                                marginRight: 5,
                                                            }}
                                                        />

                                                        {publishedDate}
                                                    </Text>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <Title
                                                level={4}
                                                style={{
                                                    marginTop: 0,
                                                    marginBottom: 10,
                                                    color: "#1f2937",
                                                    fontSize: 18,
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                {observation.title ||
                                                    "Untitled Observation"}
                                            </Title>

                                            {/* Condition */}
                                            {observation.condition_symptom_text && (
                                                <div
                                                    style={{
                                                        marginBottom: 12,
                                                    }}
                                                >
                                                    <Text
                                                        strong
                                                        style={{
                                                            display: "block",
                                                            marginBottom: 3,
                                                            color: themeColor,
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        Condition / Symptom
                                                    </Text>

                                                    <Text
                                                        style={{
                                                            color: "#4b5563",
                                                        }}
                                                    >
                                                        {
                                                            observation.condition_symptom_text
                                                        }
                                                    </Text>
                                                </div>
                                            )}

                                            {/* Observation Preview */}
                                            {observation.observation && (
                                                <Paragraph
                                                    style={{
                                                        color: "#5f6670",
                                                        lineHeight: 1.65,
                                                        marginBottom: 16,
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 4,
                                                        WebkitBoxOrient:
                                                            "vertical",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    {
                                                        observation.observation
                                                    }
                                                </Paragraph>
                                            )}

                                            {/* Duration + Frequency */}
                                            <Space
                                                wrap
                                                size={[6, 8]}
                                                style={{
                                                    marginTop: "auto",
                                                    marginBottom: 16,
                                                }}
                                            >
                                                {observation.duration_text && (
                                                    <Tag
                                                        icon={
                                                            <ClockCircleOutlined />
                                                        }
                                                        style={{
                                                            borderRadius: 20,
                                                            padding:
                                                                "3px 10px",
                                                            margin: 0,
                                                        }}
                                                    >
                                                        {
                                                            observation.duration_text
                                                        }
                                                    </Tag>
                                                )}

                                                {observation.frequency_text && (
                                                    <Tag
                                                        style={{
                                                            borderRadius: 20,
                                                            padding:
                                                                "3px 10px",
                                                            margin: 0,
                                                        }}
                                                    >
                                                        {
                                                            observation.frequency_text
                                                        }
                                                    </Tag>
                                                )}
                                            </Space>

                                            {/* Full Observation Page */}
                                            <a
                                                href={`${OBSERVATION_BASE_URL}/observations/${observation.slug}`}
                                                style={{
                                                    textDecoration: "none",
                                                    display: "block",
                                                }}
                                            >
                                                <Button
                                                    type="default"
                                                    icon={<EyeOutlined />}
                                                    block
                                                    style={{
                                                        height: 40,
                                                        borderRadius: 8,
                                                        color: themeColor,
                                                        borderColor:
                                                        themeColor,
                                                    }}
                                                >
                                                    View Full Observation
                                                </Button>
                                            </a>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>

                        {/* Pagination */}
                        {pagination.total > pagination.perPage && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 10,
                                    marginTop: 32,
                                }}
                            >
                                <Pagination
                                    current={pagination.currentPage}
                                    total={pagination.total}
                                    pageSize={pagination.perPage}
                                    showSizeChanger={false}
                                    onChange={handlePageChange}
                                />

                                <Text
                                    type="secondary"
                                    style={{
                                        fontSize: 12,
                                    }}
                                >
                                    Showing {pagination.from} -{" "}
                                    {pagination.to} of {pagination.total}
                                </Text>
                            </div>
                        )}
                    </>
                )}
        </div>
    );
};

export default OrganObservations;

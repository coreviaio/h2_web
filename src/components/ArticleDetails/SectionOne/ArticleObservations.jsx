import React, { useEffect, useState } from "react";
import {
    FaCalendarAlt,
    FaClock,
    FaEye,
    FaFileAlt,
    FaUser,
} from "react-icons/fa";

const OBSERVATION_BASE_URL = import.meta.env.VITE_OBSERVATION_URL;

const ArticleObservations = ({ articleId, articleTitle }) => {
    const [observations, setObservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 12,
        total: 0,
        from: null,
        to: null,
    });

    useEffect(() => {
        if (!articleId) {
            return;
        }

        fetchObservations(1);
    }, [articleId]);

    const fetchObservations = async (page = 1) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${OBSERVATION_BASE_URL}/api/references/article/${articleId}/observations?page=${page}`
            );

            if (!response.ok) {
                throw new Error("Failed to load approved observations.");
            }

            const data = await response.json();

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
        } catch (error) {
            console.error(
                "Failed to load article observations:",
                error
            );

            setObservations([]);

            setError(
                error?.message ||
                "Failed to load approved observations."
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        if (
            page < 1 ||
            page > pagination.lastPage ||
            page === pagination.currentPage
        ) {
            return;
        }

        fetchObservations(page);

        setTimeout(() => {
            document
                .getElementById("article-approved-observations")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
        }, 100);
    };

    const formatDate = (value) => {
        if (!value) {
            return "";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
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
            .replace(/\b\w/g, (character) =>
                character.toUpperCase()
            );
    };

    if (!articleId) {
        return null;
    }

    return (
        <div
            id="article-approved-observations"
            className="w-full mt-16 scroll-mt-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <FaFileAlt className="text-[#346896]" />

                        <h2 className="text-black font-bold text-xl md:text-2xl">
                            Approved Observations
                        </h2>
                    </div>

                    {!loading && !error && (
                        <p className="text-[#767676] text-sm mt-2">
                            {pagination.total > 0
                                ? `${pagination.total} approved ${
                                    pagination.total === 1
                                        ? "observation"
                                        : "observations"
                                } related to this article`
                                : "Approved observations related to this article"}
                        </p>
                    )}
                </div>

                {!loading &&
                    !error &&
                    pagination.total > 0 && (
                        <div className="inline-flex items-center self-start md:self-auto px-4 py-1.5 rounded-full border border-[#34689633] bg-[#3468960D] text-[#346896] text-sm font-medium">
                            {pagination.total} Observations
                        </div>
                    )}
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center min-h-[220px]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-[#346896] border-t-transparent rounded-full animate-spin" />

                        <p className="text-gray-500 text-sm">
                            Loading approved observations...
                        </p>
                    </div>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="border border-red-200 bg-red-50 rounded-lg p-5">
                    <p className="font-semibold text-red-700">
                        Unable to load observations
                    </p>

                    <p className="text-red-600 text-sm mt-1">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            fetchObservations(
                                pagination.currentPage || 1
                            )
                        }
                        className="mt-4 px-4 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-100"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty */}
            {!loading &&
                !error &&
                observations.length === 0 && (
                    <div className="border border-gray-200 bg-gray-50 rounded-xl px-6 py-10 text-center">
                        <FaFileAlt className="mx-auto text-3xl text-gray-300 mb-3" />

                        <p className="text-gray-500">
                            No approved observations are currently
                            available for this article.
                        </p>
                    </div>
                )}

            {/* Observation Cards */}
            {!loading &&
                !error &&
                observations.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {observations.map((observation) => {
                                const publishedDate =
                                    formatDate(
                                        observation.published_at ||
                                        observation.approved_at
                                    );

                                return (
                                    <div
                                        key={observation.id}
                                        className="border border-gray-200 rounded-xl p-5 flex flex-col h-full bg-white hover:shadow-md transition-shadow"
                                    >
                                        {/* Type + Date */}
                                        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3468960D] border border-[#34689625] text-[#346896] text-xs font-medium">
                                                <FaUser />

                                                {formatSubmissionType(
                                                    observation.submission_type
                                                )}
                                            </span>

                                            {publishedDate && (
                                                <span className="inline-flex items-center gap-1.5 text-gray-500 text-xs">
                                                    <FaCalendarAlt />

                                                    {publishedDate}
                                                </span>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-lg font-bold text-[#132B38] leading-6 mb-3">
                                            {observation.title ||
                                                "Untitled Observation"}
                                        </h3>

                                        {/* Condition */}
                                        {observation.condition_symptom_text && (
                                            <div className="mb-3">
                                                <p className="text-[#346896] text-xs font-bold mb-1">
                                                    Condition / Symptom
                                                </p>

                                                <p className="text-gray-600 text-sm leading-6">
                                                    {
                                                        observation.condition_symptom_text
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {/* Observation Preview */}
                                        {observation.observation && (
                                            <p
                                                className="text-[#767676] text-sm leading-6 mb-4"
                                                style={{
                                                    display:
                                                        "-webkit-box",
                                                    WebkitLineClamp: 4,
                                                    WebkitBoxOrient:
                                                        "vertical",
                                                    overflow:
                                                        "hidden",
                                                }}
                                            >
                                                {
                                                    observation.observation
                                                }
                                            </p>
                                        )}

                                        {/* Duration / Frequency */}
                                        <div className="flex flex-wrap gap-2 mt-auto mb-4">
                                            {observation.duration_text && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">
                                                    <FaClock />

                                                    {
                                                        observation.duration_text
                                                    }
                                                </span>
                                            )}

                                            {observation.frequency_text && (
                                                <span className="inline-flex items-center px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">
                                                    {
                                                        observation.frequency_text
                                                    }
                                                </span>
                                            )}
                                        </div>

                                        {/* IMPORTANT:
                                            Use normal <a>, not React Router Link,
                                            because observation detail page is on
                                            VITE_OBSERVATION_URL.
                                        */}
                                        <a
                                            href={`${OBSERVATION_BASE_URL}/observations/${observation.slug}`}
                                            className="w-full flex items-center justify-center gap-2 h-10 border border-[#346896] text-[#346896] rounded-lg font-medium text-sm hover:bg-[#346896] hover:text-white transition-colors"
                                        >
                                            <FaEye />

                                            View Full Observation
                                        </a>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {pagination.lastPage > 1 && (
                            <div className="mt-8 flex flex-col items-center gap-3">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        disabled={
                                            pagination.currentPage <=
                                            1
                                        }
                                        onClick={() =>
                                            handlePageChange(
                                                pagination.currentPage -
                                                1
                                            )
                                        }
                                        className="px-4 py-2 rounded-md border border-[#346896] text-[#346896] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#346896] hover:text-white transition"
                                    >
                                        Previous
                                    </button>

                                    <span className="text-sm text-gray-600">
                                        Page{" "}
                                        <strong>
                                            {
                                                pagination.currentPage
                                            }
                                        </strong>{" "}
                                        of{" "}
                                        <strong>
                                            {pagination.lastPage}
                                        </strong>
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            pagination.currentPage >=
                                            pagination.lastPage
                                        }
                                        onClick={() =>
                                            handlePageChange(
                                                pagination.currentPage +
                                                1
                                            )
                                        }
                                        className="px-4 py-2 rounded-md border border-[#346896] text-[#346896] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#346896] hover:text-white transition"
                                    >
                                        Next
                                    </button>
                                </div>

                                {pagination.from &&
                                    pagination.to && (
                                        <p className="text-xs text-gray-500">
                                            Showing{" "}
                                            {pagination.from} -{" "}
                                            {pagination.to} of{" "}
                                            {pagination.total}
                                        </p>
                                    )}
                            </div>
                        )}
                    </>
                )}
        </div>
    );
};

export default ArticleObservations;

import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import HomeHeader from "../../HomePage/HomeHeader";
import { getAllHandBook } from "../../../services/userServices";
import "./HandBookPage.scss";

const DEFAULT_HANDBOOK_IMAGE =
  "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80";

const TOPIC_CHIPS = [
  "Tất cả",
  "Tiêm chủng",
  "Cơ xương khớp",
  "Tiêu hóa",
  "Sống khỏe",
  "Trẻ em",
];

class HandBookPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      handbooks: [],
      filteredHandbooks: [],
      searchTerm: "",
      selectedTopic: "Tất cả",
      loading: true,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.language !== this.props.language) {
      this.fetchData();
    }
  }

  fetchData = async () => {
    try {
      this.setState({ loading: true });
      const lang = this.props.language || "vi";

      const res = await getAllHandBook({ lang }).catch(() => ({ errCode: -1 }));

      let formatted = [];
      if (res && res.errCode === 0 && Array.isArray(res.data)) {
        formatted = res.data.map((item) => {
          let title =
            item.handbookData && item.handbookData.length > 0
              ? item.handbookData[0].title
              : item.title || "Cẩm nang sức khỏe";

          let markdownContent =
            item.handbookMarkdown && item.handbookMarkdown.length > 0
              ? item.handbookMarkdown[0].contentMarkdown || ""
              : "";

          // Create a clean text excerpt from markdown
          let excerpt = markdownContent
            .replace(/[#*`_\[\]()]/g, "")
            .replace(/\n+/g, " ")
            .trim()
            .slice(0, 140);
          if (excerpt.length >= 140) excerpt += "...";
          if (!excerpt) {
            excerpt =
              "Cung cấp thông tin y khoa hữu ích, kiến thức chăm sóc sức khỏe và hướng dẫn phòng bệnh từ các bác sĩ chuyên khoa.";
          }

          let img = item.image;
          if (img && !img.startsWith("http") && !img.startsWith("data:")) {
            // Check if buffer
            img = DEFAULT_HANDBOOK_IMAGE;
          }

          return {
            id: item.id,
            title: title,
            image: img || DEFAULT_HANDBOOK_IMAGE,
            excerpt: excerpt,
            createdAt: item.createdAt || new Date(),
          };
        });
      }

      this.setState({
        handbooks: formatted,
        filteredHandbooks: formatted,
        loading: false,
      });
    } catch (e) {
      console.error("Error fetching handbook page data:", e);
      this.setState({ loading: false });
    }
  };

  handleFilter = (searchTerm, topic) => {
    const { handbooks } = this.state;
    const term = searchTerm.toLowerCase().trim();

    const filtered = handbooks.filter((item) => {
      const matchSearch =
        !term ||
        item.title.toLowerCase().includes(term) ||
        item.excerpt.toLowerCase().includes(term);

      const matchTopic =
        topic === "Tất cả" ||
        item.title.toLowerCase().includes(topic.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(topic.toLowerCase());

      return matchSearch && matchTopic;
    });

    this.setState({
      searchTerm,
      selectedTopic: topic,
      filteredHandbooks: filtered,
    });
  };

  handleSearchChange = (e) => {
    const term = e.target.value;
    this.handleFilter(term, this.state.selectedTopic);
  };

  handleTopicChip = (topic) => {
    this.handleFilter(this.state.searchTerm, topic);
  };

  handleArticleClick = (item) => {
    this.props.navigate(`/handbook/${item.id}`);
  };

  render() {
    const { filteredHandbooks, searchTerm, selectedTopic, loading } =
      this.state;

    const featuredArticle =
      filteredHandbooks.length > 0 ? filteredHandbooks[0] : null;
    const remainingArticles =
      filteredHandbooks.length > 1 ? filteredHandbooks.slice(1) : [];

    return (
      <div className="handbook-page-container">
        <HomeHeader isShowBanner={false} />

        <div className="container">
          {/* Breadcrumb */}
          <div className="handbook-breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    this.props.navigate("/home");
                  }}
                >
                  <i className="fa fa-home"></i> Trang chủ
                </a>
              </li>
              <li className="breadcrumb-item active">Cẩm nang</li>
            </ol>
          </div>

          {/* Hero Banner */}
          <div className="handbook-hero">
            <div className="hero-badge">
              <i className="fa fa-book"></i> Kiến thức y khoa chính thống
            </div>
            <h1 className="hero-title">Cẩm Nang Sức Khỏe & Y Tế</h1>
            <p className="hero-desc">
              Tổng hợp cẩm nang chăm sóc sức khỏe, kinh nghiệm thăm khám và phác
              đồ dinh dưỡng lành mạnh từ các chuyên gia y tế đầu ngành.
            </p>
          </div>

          {/* Search & Topic Filter Card */}
          <div className="handbook-filter-card">
            <div className="search-input-wrap">
              <i className="fa fa-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Tìm bài viết theo tiêu đề, triệu chứng, bệnh lý..."
                value={searchTerm}
                onChange={this.handleSearchChange}
              />
            </div>

            <div className="topic-chips-wrap">
              {TOPIC_CHIPS.map((topic, idx) => (
                <button
                  key={idx}
                  className={`chip-btn ${
                    selectedTopic === topic ? "active" : ""
                  }`}
                  onClick={() => this.handleTopicChip(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted fw-semibold">
                Đang tải bài viết cẩm nang...
              </p>
            </div>
          ) : filteredHandbooks.length > 0 ? (
            <>
              {/* Featured Article Banner */}
              {featuredArticle && !searchTerm && selectedTopic === "Tất cả" && (
                <div
                  className="featured-article-card"
                  onClick={() => this.handleArticleClick(featuredArticle)}
                >
                  <div className="row g-0 align-items-center">
                    <div className="col-lg-6 col-12">
                      <div className="featured-img-wrap">
                        <img
                          src={featuredArticle.image}
                          alt={featuredArticle.title}
                          className="featured-img"
                          onError={(e) => {
                            e.target.src = DEFAULT_HANDBOOK_IMAGE;
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 col-12">
                      <div className="featured-content">
                        <span className="featured-badge">
                          <i className="fa fa-star"></i> BÀI VIẾT NỔI BẬT
                        </span>
                        <h2 className="featured-title">
                          {featuredArticle.title}
                        </h2>
                        <p className="featured-desc">
                          {featuredArticle.excerpt}
                        </p>
                        <div className="featured-footer">
                          <span className="read-time">
                            <i className="fa fa-clock-o"></i> 5 phút đọc
                          </span>
                          <button
                            className="btn-read-now"
                            onClick={(e) => {
                              e.stopPropagation();
                              this.handleArticleClick(featuredArticle);
                            }}
                          >
                            <span>Đọc bài viết</span>
                            <i className="fa fa-arrow-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results meta */}
              <div className="results-meta">
                <h2 className="results-title">Tất cả bài viết</h2>
                <div className="results-count">
                  {filteredHandbooks.length} bài viết
                </div>
              </div>

              {/* Grid of Articles */}
              <div className="row">
                {(searchTerm || selectedTopic !== "Tất cả"
                  ? filteredHandbooks
                  : remainingArticles
                ).map((article) => (
                  <div
                    key={article.id}
                    className="col-lg-4 col-md-6 col-12 handbook-card-wrap"
                  >
                    <div
                      className="handbook-card"
                      onClick={() => this.handleArticleClick(article)}
                    >
                      <div className="article-img-wrap">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="article-img"
                          onError={(e) => {
                            e.target.src = DEFAULT_HANDBOOK_IMAGE;
                          }}
                        />
                        <span className="badge-category">Cẩm nang y tế</span>
                      </div>

                      <div className="article-body">
                        <h3 className="article-title" title={article.title}>
                          {article.title}
                        </h3>

                        <p className="article-excerpt">{article.excerpt}</p>

                        <div className="article-footer">
                          <div className="meta-info">
                            <i className="fa fa-clock-o"></i>
                            <span>4 phút đọc</span>
                          </div>

                          <button
                            className="btn-read"
                            onClick={(e) => {
                              e.stopPropagation();
                              this.handleArticleClick(article);
                            }}
                          >
                            <span>Chi tiết</span>
                            <i className="fa fa-arrow-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <i className="fa fa-book empty-icon"></i>
              <h4 className="empty-title">Không tìm thấy bài viết phù hợp</h4>
              <p className="empty-desc">
                Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
              </p>
              <button
                className="btn btn-outline-primary rounded-pill px-4 mt-3"
                onClick={() => this.handleFilter("", "Tất cả")}
              >
                <i className="fa fa-refresh me-2"></i>Xem tất cả cẩm nang
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    navigate: (path) => dispatch(push(path)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HandBookPage);

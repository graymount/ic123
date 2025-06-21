# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains specifications for an IC (Integrated Circuit) industry information aggregation platform, designed to serve as a navigation hub for Chinese IC professionals - essentially an "IC industry version of Hao123".

## Current Repository State

The repository is currently in early specification phase with minimal code structure:
- `product.md`: Contains detailed product requirements and specifications in Chinese
- No build system, package management, or code architecture established yet

## Key Product Features (from product.md)

The platform aims to provide:
1. **Website Recommendations**: Categorized IC industry websites (industry portals, design tools, academic resources, job boards, forums)
2. **WeChat Public Account Directory**: Curated list of IC industry public accounts
3. **Industry News Aggregation**: Latest IC industry news from various sources
4. **Markdown Table Output**: All content formatted for easy publishing and database import

## Target Audience

Chinese IC industry professionals seeking centralized access to industry resources, news, and networking opportunities.

## Development Notes

- Content should be primarily in Chinese where applicable
- Focus on accuracy and professional tone
- All outputs should be production-ready for frontend publishing
- Content verification needed for uncertain information (mark with "（待确认）")

## Next Steps for Development

When code is added to this repository, consider:
- Web scraping and content aggregation system
- Database design for storing categorized resources
- Frontend for displaying the aggregated content
- Content management system for updates
- Integration with Chinese IC industry data sources
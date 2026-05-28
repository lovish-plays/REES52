import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is missing" }, { status: 400 });
  }

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 10000
    });

    const $ = cheerio.load(html);
    let productImageUrl = null;
    let productTitle = null;

    // 1. CHOSEN TARGETING PATTERNS FOR REES52.COM
    if (url.includes('rees52.com')) {
      const mainImage = $('.product__media img').first().length ? $('.product__media img').first() :
                        $('.product-single__photo img').first().length ? $('.product-single__photo img').first() :
                        $('img[class*="product"]').first();

      if (mainImage.length) {
        const srcAttr = mainImage.attr('src');
        const dataSrcAttr = mainImage.attr('data-src') || mainImage.attr('data-lazy');
        const srcsetAttr = mainImage.attr('data-srcset') || mainImage.attr('srcset');

        if (dataSrcAttr) {
          productImageUrl = dataSrcAttr;
        } else if (srcsetAttr) {
          productImageUrl = srcsetAttr.split(',')[0].trim().split(' ')[0];
        } else if (srcAttr && !srcAttr.startsWith('data:')) {
          productImageUrl = srcAttr;
        }
      }

      // Pattern B: Fallback check against structural product template layouts 
      if (!productImageUrl) {
        const fallbackImage = $('.featured-image').first().length ? $('.featured-image').first() :
                              $('.product-gallery__image img').first();
        if (fallbackImage.length) {
          productImageUrl = fallbackImage.attr('data-src') || fallbackImage.attr('src');
        }
      }

      productTitle = $('.product-single__title').first().text() || $('.product__title').first().text() || $('h1').first().text() || "External Link Product";
    } 
    
    // 2. EXISTENT FALLBACK PATTERNS FOR OTHER WEB STORES
    else {
      productImageUrl = $('meta[property="og:image"]').attr('content') || 
                        $('meta[name="twitter:image"]').attr('content') ||
                        $('main img').first().attr('src');

      productTitle = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content') || $('title').first().text() || "External Link Product";
    }

    // Clean up protocol prefixes if URLs are returned relative or schemaless
    if (productImageUrl && productImageUrl.startsWith('//')) {
      productImageUrl = `https:${productImageUrl}`;
    } else if (productImageUrl && productImageUrl.startsWith('/')) {
      // Handle domain-relative absolute structures
      productImageUrl = `https://rees52.com${productImageUrl}`;
    }

    // Clean up title text
    const cleanTitle = productTitle ? productTitle.trim().replace(/\s+/g, ' ') : "External Link Product";

    return NextResponse.json({
      success: !!productImageUrl,
      thumbnail: productImageUrl || "https://rees52.com/fallback-placeholder.png",
      title: cleanTitle
    });

  } catch (error: any) {
    console.error("Scraper Failure Execution Log:", error.message);
    return NextResponse.json({ 
      success: false, 
      thumbnail: "https://rees52.com/fallback-placeholder.png",
      title: "External Link Product"
    });
  }
}

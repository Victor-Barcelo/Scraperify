<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use AppBundle\Lib\Scraper;

class MainController extends Controller
{
    /**
     * @Route("/api/scrape/{langFrom}/{langTo}/{cssSelector}/{url}", name="getScrapedData")
     */
    public function getScrapedDataAction($langFrom, $langTo, $cssSelector, $url)
    {
        $url = urldecode($url);
        $cssSelector = urldecode($cssSelector);
        $sc = new Scraper($langFrom, $langTo, $cssSelector, $url);
        $nodes = $sc->getNodes();
        $return = json_encode(array("nodes" => $nodes));

        return new Response(
            $return, 200, array('Content-Type' => 'application/json')
        );
    }
}
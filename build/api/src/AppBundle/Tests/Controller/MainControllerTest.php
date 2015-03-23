<?php

namespace AppBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class MainControllerTest extends WebTestCase
{
    public function testgetScrapedDataAction()
    {
        $client = static::createClient();
        $client->request('GET', '/Ng-ex2/build/api/scrape/es/es/.post_title/victorbarcelo.net');
        $response = $client->getResponse();
        $this->assertSame(200, $client->getResponse()->getStatusCode());
        $this->assertSame('application/json', $response->headers->get('Content-Type'));
        $this->assertNotEmpty(json_decode($response->getContent())->nodes);
    }
}